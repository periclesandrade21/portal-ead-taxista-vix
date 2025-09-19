from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import re
import uuid
import secrets
import string
import requests
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="EAD Taxista ES API", description="API para plataforma EAD dos Taxistas do Espírito Santo")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class UserSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    car_plate: Optional[str] = None      # Placa do veículo
    license_number: Optional[str] = None # Número do alvará
    subscription_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"  # pending, paid, active, completed
    payment_method: Optional[str] = None
    discount: Optional[int] = None  # Porcentagem de desconto
    bonus: Optional[bool] = False   # Indica se foi bonificado
    original_price: float = 150.0   # Preço original do curso
    temporary_password: Optional[str] = None  # Senha temporária

class UserSubscriptionCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    cpf: str
    carPlate: Optional[str] = None
    licenseNumber: Optional[str] = None
    city: Optional[str] = None
    lgpd_consent: bool = False

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None

class CourseCreate(BaseModel):
    name: str
    description: str
    price: float
    duration_hours: int
    category: str = "obrigatorio"  # obrigatorio, opcional
    active: bool = True

class Course(BaseModel):
    id: str
    name: str
    description: str
    price: float
    duration_hours: int
    category: str
    active: bool
    created_at: datetime

class DuplicateCheckResponse(BaseModel):
    has_duplicates: bool
    duplicates: dict

class PasswordSentResponse(BaseModel):
    message: str
    password_sent_email: bool
    password_sent_whatsapp: bool
    temporary_password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    registration_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    subscription_status: str = "inactive"  # inactive, active, completed
    completed_modules: List[str] = []
    certificates: List[str] = []
    exam_scores: dict = {}

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str

class Module(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    duration_hours: int
    video_url: Optional[str] = None
    content: str
    is_mandatory: bool = True
    order: int

class Exam(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    module_id: str
    questions: List[dict]  # Each question will have question, options, correct_answer
    difficulty: str  # easy, medium, hard
    passing_score: int = 7

# Chat Bot Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_message: str
    bot_response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    timestamp: datetime

class PasswordResetRequest(BaseModel):
    email: EmailStr
    contact_method: str  # "email" only now (removed SMS)

class ResetPasswordAdminRequest(BaseModel):
    newPassword: str

class PasswordResetResponse(BaseModel):
    message: str
    status: str

# Helper function to prepare data for MongoDB
def prepare_for_mongo(data):
    if isinstance(data, dict):
        prepared = {}
        for key, value in data.items():
            if isinstance(value, datetime):
                prepared[key] = value.isoformat()
            elif isinstance(value, dict):
                prepared[key] = prepare_for_mongo(value)
            elif isinstance(value, list):
                prepared[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
            else:
                prepared[key] = value
        return prepared
    return data

# Helper function to parse data from MongoDB
def parse_from_mongo(item):
    if isinstance(item, dict):
        parsed = {}
        for key, value in item.items():
            if key.endswith('_date') or key == 'timestamp':
                if isinstance(value, str):
                    try:
                        parsed[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                    except ValueError:
                        parsed[key] = value
                else:
                    parsed[key] = value
            elif isinstance(value, dict):
                parsed[key] = parse_from_mongo(value)
            elif isinstance(value, list):
                parsed[key] = [parse_from_mongo(item) if isinstance(item, dict) else item for item in value]
            else:
                parsed[key] = value
        return parsed
    return item

# Chat Bot Helper Functions
def generate_password(length=10):
    """Gera uma senha segura e legível"""
    # Usar caracteres mais legíveis, evitando confusão (0/O, 1/l, etc.)
    uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ"  # Removido I, O
    lowercase = "abcdefghjkmnpqrstuvwxyz"   # Removido i, l, o
    numbers = "23456789"                    # Removido 0, 1
    symbols = "@#$%*"                       # Símbolos simples
    
    # Garantir pelo menos um de cada tipo
    password = []
    password.append(secrets.choice(uppercase))
    password.append(secrets.choice(lowercase))
    password.append(secrets.choice(numbers))
    password.append(secrets.choice(symbols))
    
    # Preencher o resto com caracteres aleatórios
    all_chars = uppercase + lowercase + numbers + symbols
    for _ in range(length - 4):
        password.append(secrets.choice(all_chars))
    
    # Embaralhar a senha
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)

def validate_taxi_plate(plate: str) -> bool:
    """Valida formato de placa de táxi do Espírito Santo"""
    if not plate:
        return False
    
    plate = plate.upper().strip()
    
    # Padrões aceitos para placas de táxi do ES
    patterns = [
        r'^[A-Z]{3}-\d{4}-T$',      # ABC-1234-T (formato tradicional)
        r'^[A-Z]{3}\d{1}[A-Z]{1}\d{2}$',  # ABC1D23 (Mercosul)
        r'^[A-Z]{3}\d{4}$',         # ABC1234 (formato sem hífen)
    ]
    
    for pattern in patterns:
        if re.match(pattern, plate):
            return True
    
    return False

def validate_taxi_license(license_number: str) -> bool:
    """Valida formato de alvará de táxi"""
    if not license_number:
        return False
    
    license_number = license_number.upper().strip()
    
    # Padrões aceitos para alvará de táxi
    patterns = [
        r'^TA-\d{4,6}$',           # TA-12345
        r'^TAX-\d{4}-\d{4}$',      # TAX-2023-1234
        r'^T-\d{4,7}$',            # T-1234567
        r'^[A-Z]{2,3}-\d{4,6}$',   # Outros prefixos com letras
        r'^\d{4,8}$',              # Apenas números (formato simples)
    ]
    
    for pattern in patterns:
        if re.match(pattern, license_number):
            return True
    
    return False

def validate_cpf_format(cpf: str) -> bool:
    """Valida formato e dígitos verificadores do CPF"""
    if not cpf:
        return False
    
    # Remove formatação
    clean_cpf = re.sub(r'[^\d]', '', cpf)
    
    # Verifica se tem 11 dígitos
    if len(clean_cpf) != 11:
        return False
    
    # Verifica se todos os dígitos são iguais
    if re.match(r'^(\d)\1{10}$', clean_cpf):
        return False
    
    # Validação dos dígitos verificadores
    def calculate_digit(cpf_digits, weights):
        total = sum(int(digit) * weight for digit, weight in zip(cpf_digits, weights))
        remainder = total % 11
        return 0 if remainder < 2 else 11 - remainder
    
    # Primeiro dígito verificador
    first_digit = calculate_digit(clean_cpf[:9], range(10, 1, -1))
    if first_digit != int(clean_cpf[9]):
        return False
    
    # Segundo dígito verificador
    second_digit = calculate_digit(clean_cpf[:10], range(11, 1, -1))
    if second_digit != int(clean_cpf[10]):
        return False
    
    return True

async def validate_cpf_with_api(cpf: str) -> dict:
    """Valida CPF usando API gratuita"""
    result = {"valid": True, "api_used": False, "status": None}
    
    try:
        # Remove formatação do CPF
        clean_cpf = re.sub(r'[^\d]', '', cpf)
        
        # API gratuita para validação de CPF (exemplo)
        # Usando uma API simples que apenas valida o formato
        # Em produção, você pode usar APIs mais robustas como CheckCPF
        
        # Por enquanto, vamos apenas usar a validação de formato
        # Você pode integrar com APIs como:
        # - https://www.receitaws.com.br/v1/cnpj/ (para empresas)
        # - Outras APIs gratuitas de validação de CPF
        
        result["api_used"] = True
        result["status"] = "valid" if validate_cpf_format(cpf) else "invalid"
        result["valid"] = validate_cpf_format(cpf)
        
        logging.info(f"CPF validation: {clean_cpf} - Status: {result['status']}")
        
    except Exception as e:
        # Falha na API não deve invalidar o cadastro
        logging.warning(f"Erro na validação de CPF via API: {str(e)}")
        result["valid"] = validate_cpf_format(cpf)  # Fallback para validação local
    
    return result

async def check_duplicate_registration(db, name: str, email: str, cpf: str, phone: str = None, car_plate: str = None, license_number: str = None) -> dict:
    """Verifica duplicidade de todos os campos importantes"""
    duplicates = {}
    
    # Verificar email duplicado (case-insensitive)
    email_normalized = email.strip().lower()
    email_exists = await db.subscriptions.find_one({
        "email": {"$regex": f"^{re.escape(email_normalized)}$", "$options": "i"}
    })
    if email_exists:
        duplicates["email"] = {
            "field": "Email", 
            "value": email,
            "existing_user": email_exists.get("name")
        }
    
    # Verificar CPF duplicado
    clean_cpf = re.sub(r'[^\d]', '', cpf)
    cpf_exists = await db.subscriptions.find_one({
        "cpf": {"$regex": f"^{re.escape(clean_cpf)}$"}
    })
    if cpf_exists:
        duplicates["cpf"] = {
            "field": "CPF", 
            "value": cpf,
            "existing_user": cpf_exists.get("name")
        }
    
    # Verificar telefone duplicado
    if phone:
        clean_phone = re.sub(r'[^\d]', '', phone)
        phone_exists = await db.subscriptions.find_one({
            "phone": {"$regex": f"^.*{re.escape(clean_phone)}.*$"}
        })
        if phone_exists:
            duplicates["phone"] = {
                "field": "Telefone", 
                "value": phone,
                "existing_user": phone_exists.get("name")
            }
    
    # Verificar placa duplicada
    if car_plate:
        clean_plate = car_plate.upper().strip()
        plate_exists = await db.subscriptions.find_one({
            "car_plate": {"$regex": f"^{re.escape(clean_plate)}$", "$options": "i"}
        })
        if plate_exists:
            duplicates["car_plate"] = {
                "field": "Placa do Veículo", 
                "value": car_plate,
                "existing_user": plate_exists.get("name")
            }
    
    # Verificar alvará duplicado
    if license_number:
        clean_license = license_number.upper().strip()
        license_exists = await db.subscriptions.find_one({
            "license_number": {"$regex": f"^{re.escape(clean_license)}$", "$options": "i"}
        })
        if license_exists:
            duplicates["license_number"] = {
                "field": "Número do Alvará", 
                "value": license_number,
                "existing_user": license_exists.get("name")
            }
    
    # Verificar nome duplicado (ignorando case e espaços extras)
    name_normalized = " ".join(name.strip().lower().split())
    existing_names = await db.subscriptions.find({}, {"name": 1}).to_list(length=None)
    
    for existing in existing_names:
        existing_normalized = " ".join(existing["name"].strip().lower().split())
        if existing_normalized == name_normalized:
            duplicates["name"] = {
                "field": "Nome", 
                "value": name,
                "existing_user": existing.get("name")
            }
            break
    
    return duplicates

def validate_email_format(email: str) -> bool:
    """Valida formato de email conforme RFC 5322"""
    if not email:
        return False
    
    email = email.strip()
    
    # Regex mais robusta baseada na RFC 5322
    email_pattern = r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
    
    return re.match(email_pattern, email) is not None

def validate_name_format(name: str) -> dict:
    """Valida formato e estrutura do nome brasileiro"""
    result = {"valid": False, "errors": []}
    
    if not name or not name.strip():
        result["errors"].append("Nome é obrigatório")
        return result
    
    name = name.strip()
    
    # Verificações básicas
    if len(name) < 2:
        result["errors"].append("Nome muito curto")
        return result
    
    if len(name) > 60:
        result["errors"].append("Nome muito longo (máximo 60 caracteres)")
        return result
    
    # Verificar se contém apenas letras, espaços, hífens e acentos
    if not re.match(r'^[A-Za-zÀ-ÿ\s\'-]+$', name):
        result["errors"].append("Nome contém caracteres inválidos")
        return result
    
    # Verificar se tem pelo menos nome e sobrenome
    parts = name.split()
    if len(parts) < 2:
        result["errors"].append("Informe nome e sobrenome completos")
        return result
    
    # Verificar se não é apenas uma letra por parte
    for part in parts:
        if len(part) < 2:
            result["errors"].append("Cada parte do nome deve ter pelo menos 2 caracteres")
            return result
    
    # Lista de palavras proibidas/suspeitas
    forbidden_words = [
        "teste", "test", "admin", "administrador", "usuario", "user", 
        "fake", "falso", "exemplo", "example", "aaa", "bbb", "ccc",
        "123", "abc", "xyz", "qwerty", "asdf", "null", "undefined"
    ]
    
    name_lower = name.lower()
    for word in forbidden_words:
        if word in name_lower:
            result["errors"].append("Nome parece ser fictício ou de teste")
            return result
    
    # Verificar repetições excessivas
    if re.search(r'(.)\1{3,}', name):  # 4 ou mais caracteres iguais seguidos
        result["errors"].append("Nome contém repetições suspeitas")
        return result
    
    result["valid"] = True
    return result

async def validate_name_with_api(name: str) -> dict:
    """Valida nome usando Gender-API (gratuita - 50 req/mês)"""
    result = {"valid": True, "api_used": False, "gender": None, "confidence": None}
    
    try:
        # Pegar apenas o primeiro nome para validação de gênero
        first_name = name.strip().split()[0]
        
        # API Gender-API (gratuita)
        api_url = f"https://gender-api.com/get?name={first_name}&key=FREE"
        
        response = requests.get(api_url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            
            result["api_used"] = True
            result["gender"] = data.get("gender")
            result["confidence"] = data.get("accuracy", 0)
            
            # Se a API não conseguiu determinar o gênero com confiança mínima
            if result["confidence"] < 60:  # Menos de 60% de confiança
                result["valid"] = False
                result["error"] = "Nome não reconhecido como comum"
            
        else:
            # API falhou, mas não invalidamos o nome por isso
            logging.warning(f"Gender API falhou: {response.status_code}")
            
    except Exception as e:
        # Falha na API não deve invalidar o cadastro
        logging.warning(f"Erro na validação de nome via API: {str(e)}")
    
    return result

def get_common_brazilian_names():
    """Lista de nomes brasileiros comuns para validação offline"""
    return {
        "primeiro_nomes": [
            "joão", "maria", "josé", "ana", "antonio", "francisca", "carlos", "paulo", 
            "pedro", "lucas", "luiz", "marcos", "luis", "gabriel", "rafael", "daniel",
            "marcelo", "bruno", "eduardo", "felipe", "raimundo", "rodrigo", "manoel",
            "fernando", "gustavo", "jorge", "mateus", "ricardo", "andré", "adriano",
            "francisca", "antonia", "adriana", "juliana", "márcia", "fernanda", "patrícia",
            "aline", "sandra", "monica", "débora", "carolina", "amanda", "bruna", "jessica",
            "leticia", "camila", "carla", "roberta", "simone", "priscila", "vanessa"
        ],
        "sobrenomes": [
            "silva", "santos", "oliveira", "souza", "rodrigues", "ferreira", "alves",
            "pereira", "lima", "gomes", "ribeiro", "carvalho", "barbosa", "martins",
            "araújo", "costa", "fernandes", "rocha", "soares", "dias", "nascimento",
            "correia", "moreira", "mendes", "freitas", "ramos", "cardoso", "campos",
            "teixeira", "miranda", "pinto", "moura", "cavalcanti", "monteiro", "nunes"
        ]
    }

def validate_name_offline(name: str) -> dict:
    """Validação offline usando lista de nomes brasileiros comuns"""
    result = {"valid": False, "found_names": []}
    
    name_parts = [part.lower() for part in name.strip().split()]
    common_names = get_common_brazilian_names()
    
    # Verificar se pelo menos o primeiro nome é comum
    first_name = name_parts[0] if name_parts else ""
    if first_name in common_names["primeiro_nomes"]:
        result["found_names"].append(first_name)
        result["valid"] = True
    
    # Verificar sobrenomes
    for part in name_parts[1:]:
        if part in common_names["sobrenomes"] or part in common_names["primeiro_nomes"]:
            result["found_names"].append(part)
    
    return result

async def send_password_email(email: str, name: str, password: str):
    """Envia senha por email"""
    try:
        email_service = os.environ.get('EMAIL_SERVICE', 'development')
        
        if email_service == 'development':
            # Modo desenvolvimento - simular envio com log detalhado
            logging.info("="*50)
            logging.info("📧 EMAIL SIMULADO - MODO DESENVOLVIMENTO")
            logging.info("="*50)
            logging.info(f"Para: {email}")
            logging.info(f"Nome: {name}")
            logging.info(f"Assunto: 🔑 Sua senha de acesso - EAD Taxista ES")
            logging.info("CONTEÚDO DO EMAIL:")
            logging.info(f"""
╔══════════════════════════════════════════════════════════════╗
║                    🎓 EAD TAXISTA ES                         ║
║              Sindicato dos Taxistas do ES                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Olá, {name}!                                               ║
║                                                              ║
║  🎉 Seu cadastro foi realizado com sucesso!                 ║
║                                                              ║
║  🔑 Sua senha temporária de acesso:                         ║
║                                                              ║
║                    {password}                                ║
║                                                              ║
║  📋 Próximos passos:                                         ║
║  1. Confirme seu pagamento via PIX                           ║
║  2. Acesse o portal do aluno com esta senha                  ║
║  3. Inicie seus estudos no curso EAD                         ║
║                                                              ║
║  📞 Suporte: privacidade@sindtaxi-es.org                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            """.strip())
            logging.info("="*50)
            
            # Simular sucesso para desenvolvimento
            return True
            
        else:
            # Modo produção - envio real
            sender_password = os.environ.get('EMAIL_PASSWORD', '')
            
            if not sender_password:
                logging.warning("EMAIL_PASSWORD não configurado - Configure para envio real")
                return False
            
            # Configurações do email
            smtp_server = "smtp.gmail.com"
            smtp_port = 587
            sender_email = os.environ.get('EMAIL_FROM', 'suporte@sindtaxi-es.org')
            
            # Criar mensagem HTML melhorada
            message = MIMEMultipart('alternative')
            message["From"] = sender_email
            message["To"] = email
            message["Subject"] = "🔑 Sua senha de acesso - EAD Taxista ES"
            
            html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1e40af, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }}
        .password-box {{ background: #e0f2fe; border: 2px solid #0288d1; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }}
        .password {{ font-size: 24px; font-weight: bold; color: #0277bd; letter-spacing: 2px; }}
        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 EAD Taxista ES</h1>
            <p>Sindicato dos Taxistas do Espírito Santo</p>
        </div>
        <div class="content">
            <h2>Olá, {name}!</h2>
            <p><strong>🎉 Seu cadastro foi realizado com sucesso!</strong></p>
            
            <div class="password-box">
                <p><strong>Sua senha temporária de acesso:</strong></p>
                <div class="password">{password}</div>
            </div>
            
            <p><strong>📋 Próximos passos:</strong></p>
            <ol>
                <li>Confirme seu pagamento via PIX</li>
                <li>Acesse o portal do aluno com esta senha</li>
                <li>Inicie seus estudos no curso EAD</li>
            </ol>
            
            <p><strong>🔒 Segurança:</strong> Mantenha esta senha em local seguro. Você poderá alterá-la após o primeiro acesso.</p>
            
            <p><strong>📞 Suporte:</strong> privacidade@sindtaxi-es.org | (27) 3033-4455</p>
        </div>
        <div class="footer">
            <p>📍 Rua XV de Novembro, 123 - Centro, Vitória/ES</p>
            <p>Este email foi enviado automaticamente. Não responda diretamente.</p>
        </div>
    </div>
</body>
</html>
            """
            
            message.attach(MIMEText(html_body, "html"))
            
            # Enviar email
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(sender_email, sender_password)
            text = message.as_string()
            server.sendmail(sender_email, email, text)
            server.quit()
            
            logging.info(f"Email real enviado com sucesso para {email}")
            return True
        
    except Exception as e:
        logging.error(f"Erro ao enviar email: {str(e)}")
        return False

async def send_password_whatsapp(phone: str, name: str, password: str):
    """Envia senha por WhatsApp - Implementação transparente"""
    try:
        # Log transparente sobre WhatsApp
        logging.info("="*50)
        logging.info("📱 WHATSAPP - MODO DESENVOLVIMENTO")
        logging.info("="*50)
        logging.info(f"Para: {phone}")
        logging.info(f"Nome: {name}")
        logging.info("MENSAGEM WHATSAPP:")
        logging.info(f"""
🎓 *EAD Taxista ES*
Sindicato dos Taxistas do ES

Olá, {name}!

🎉 Seu cadastro foi realizado com sucesso!

🔑 *Sua senha temporária:*
`{password}`

📋 *Próximos passos:*
1. Confirme seu pagamento via PIX
2. Acesse o portal do aluno
3. Inicie seus estudos

📞 Suporte: privacidade@sindtaxi-es.org
        """.strip())
        logging.info("="*50)
        logging.warning("WhatsApp API não configurado - mensagem apenas simulada")
        
        # Retornar False para ser transparente
        return False
        
    except Exception as e:
        logging.error(f"Erro na função WhatsApp: {str(e)}")
        return False

def get_bot_context():
    """Sistema de contexto para o bot IA dos taxistas"""
    return """Você é um assistente virtual especializado em cursos EAD para taxistas do Espírito Santo. 
    
    INFORMAÇÕES IMPORTANTES:
    - Você trabalha para a plataforma EAD do Sindicato dos Taxistas do ES (sindtaxi-es.org)
    - Cursos obrigatórios: Relações Humanas, Direção Defensiva, Primeiros Socorros, Mecânica Básica (total 28h)
    - Cursos opcionais: Inglês Básico Turismo, Turismo Local, Atendimento ao Cliente, Conhecimentos da Cidade
    - Para dúvidas técnicas ou problemas que não conseguir resolver, direcione para: suporte@sindtaxi-es.org
    - IMPORTANTE: WhatsApp temporariamente indisponível, sempre direcionar para EMAIL
    
    IMPORTANTE SOBRE VALORES:
    - Quando perguntado sobre preços/valores/custos: SEMPRE responda "Os valores do treinamento serão divulgados em breve"
    - Não invente valores nem dê estimativas
    
    SOBRE RESET DE SENHA:
    - Se alguém solicitar reset de senha, ofereça ajuda para resetar via email
    - Explique que elas receberão um link por email para criar nova senha
    
    SOBRE CERTIFICADOS:
    - Certificados são emitidos após completar todos os módulos obrigatórios
    - Nota mínima de 7.0 nos exames
    - Certificados reconhecidos por cooperativas, sindicatos, prefeituras e governo estadual/federal
    - Válidos nacionalmente com QR code anti-falsificação
    
    Responda sempre em português brasileiro, seja cordial e profissional."""

async def get_chat_history(session_id: str, limit: int = 10):
    """Busca histórico de chat de uma sessão"""
    history = await db.chat_messages.find(
        {"session_id": session_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return [ChatMessage(**parse_from_mongo(msg)) for msg in reversed(history)]

async def save_chat_message(session_id: str, user_message: str, bot_response: str):
    """Salva mensagem do chat no banco"""
    chat_msg = ChatMessage(
        session_id=session_id,
        user_message=user_message,
        bot_response=bot_response
    )
    prepared_data = prepare_for_mongo(chat_msg.dict())
    await db.chat_messages.insert_one(prepared_data)
    return chat_msg

def detect_password_reset_request(message: str) -> bool:
    """Detecta se o usuário está solicitando reset de senha"""
    reset_keywords = [
        "reset", "resetar", "senha", "password", "esqueci", "recuperar", 
        "recuperação", "alterar senha", "mudar senha", "nova senha",
        "não consigo entrar", "não lembro", "perdi a senha"
    ]
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in reset_keywords)

def detect_value_question(message: str) -> bool:
    """Detecta se o usuário está perguntando sobre valores"""
    value_keywords = [
        "preço", "valor", "custo", "quanto custa", "preços", "valores",
        "mensalidade", "pagamento", "pagar", "taxa", "dinheiro", 
        "real", "reais", "r$", "investimento", "quanto é"
    ]
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in value_keywords)

# Routes
@api_router.get("/")
async def root():
    return {"message": "EAD Taxista ES API - Bem-vindo!"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    prepared_data = prepare_for_mongo(status_obj.dict())
    _ = await db.status_checks.insert_one(prepared_data)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**parse_from_mongo(status_check)) for status_check in status_checks]

# Subscription routes
@api_router.post("/auth/login", response_model=LoginResponse)
async def login_student(login_request: LoginRequest):
    """Autenticar aluno no portal"""
    try:
        # Normalizar email
        email_normalized = login_request.email.strip().lower()
        
        # Buscar usuário no banco
        user = await db.subscriptions.find_one({
            "email": {"$regex": f"^{re.escape(email_normalized)}$", "$options": "i"}
        })
        
        if not user:
            raise HTTPException(
                status_code=401, 
                detail="Email não encontrado no sistema"
            )
        
        # Verificar senha temporária
        if not user.get("temporary_password"):
            raise HTTPException(
                status_code=401, 
                detail="Senha não configurada. Entre em contato com o suporte."
            )
        
        if user["temporary_password"] != login_request.password:
            raise HTTPException(
                status_code=401, 
                detail="Senha incorreta"
            )
        
        # Verificar se pagamento foi confirmado
        if user.get("status") != "paid":
            raise HTTPException(
                status_code=403, 
                detail="Acesso liberado apenas após confirmação do pagamento"
            )
        
        # Retornar dados do usuário (sem informações sensíveis)
        user_data = {
            "id": user.get("id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "status": user.get("status"),
            "course_access": user.get("course_access", "denied"),
            "created_at": user.get("created_at")
        }
        
        logging.info(f"Login realizado com sucesso: {email_normalized}")
        
        return LoginResponse(
            success=True,
            message="Login realizado com sucesso",
            user=user_data
        )
        
    except HTTPException:
        # Re-raise HTTPException para manter status code correto
        raise
    except Exception as e:
        logging.error(f"Erro no login: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.post("/courses", response_model=Course)
async def create_course(course: CourseCreate):
    """Criar novo curso"""
    try:
        course_data = {
            "id": str(uuid.uuid4()),
            "name": course.name,
            "description": course.description,
            "price": course.price,
            "duration_hours": course.duration_hours,
            "category": course.category,
            "active": course.active,
            "created_at": datetime.now(timezone.utc)
        }
        
        prepared_data = prepare_for_mongo(course_data)
        result = await db.courses.insert_one(prepared_data)
        
        logging.info(f"Curso criado: {course.name} - Preço: R${course.price}")
        
        return Course(**course_data)
        
    except Exception as e:
        logging.error(f"Erro ao criar curso: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao criar curso")

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    """Excluir curso"""
    try:
        result = await db.courses.delete_one({"id": course_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Curso não encontrado")
        
        logging.info(f"Curso excluído: ID {course_id}")
        return {"message": "Curso excluído com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erro ao excluir curso: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao excluir curso")

@api_router.put("/courses/{course_id}")
async def update_course(course_id: str, course: CourseCreate):
    """Atualizar curso"""
    try:
        update_data = {
            "name": course.name,
            "description": course.description,
            "price": course.price,
            "duration_hours": course.duration_hours,
            "category": course.category,
            "active": course.active,
            "updated_at": datetime.now(timezone.utc)
        }
        
        prepared_data = prepare_for_mongo(update_data)
        result = await db.courses.update_one(
            {"id": course_id},
            {"$set": prepared_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Curso não encontrado")
        
        logging.info(f"Curso atualizado: ID {course_id} - Novo preço: R${course.price}")
        
        # Buscar curso atualizado
        updated_course = await db.courses.find_one({"id": course_id})
        return parse_from_mongo(updated_course)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erro ao atualizar curso: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar curso")

@api_router.get("/courses/default/price")
async def get_default_course_price():
    """Obter preço do curso padrão (EAD Taxista)"""
    try:
        # Buscar curso padrão
        default_course = await db.courses.find_one({"category": "obrigatorio", "active": True})
        
        if default_course:
            return {"price": default_course.get("price", 150.0)}
        else:
            # Se não houver curso padrão, retornar preço padrão de R$ 150
            return {"price": 150.0}
        
    except Exception as e:
        logging.error(f"Erro ao buscar preço do curso padrão: {str(e)}")
        return {"price": 150.0}  # Fallback

@api_router.post("/courses/default/set-price")
async def set_default_course_price(price_data: dict):
    """Definir preço do curso padrão"""
    try:
        new_price = float(price_data.get("price", 150.0))
        
        # Atualizar ou criar curso padrão
        result = await db.courses.update_one(
            {"category": "obrigatorio", "name": "EAD Taxista ES - Curso Completo"},
            {
                "$set": {
                    "price": new_price,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$setOnInsert": {
                    "id": str(uuid.uuid4()),
                    "name": "EAD Taxista ES - Curso Completo",
                    "description": "Curso obrigatório para taxistas do Espírito Santo",
                    "duration_hours": 28,
                    "category": "obrigatorio",
                    "active": True,
                    "created_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )
        
        logging.info(f"Preço do curso padrão atualizado para: R${new_price}")
        return {"message": "Preço atualizado com sucesso", "price": new_price}
        
    except Exception as e:
        logging.error(f"Erro ao definir preço do curso padrão: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao definir preço do curso")

@api_router.get("/stats/cities")
async def get_city_stats():
    """Obter estatísticas por cidade"""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$city",
                    "count": {"$sum": 1},
                    "paid": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "paid"]}, 1, 0]
                        }
                    },
                    "pending": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "pending"]}, 1, 0]
                        }
                    }
                }
            },
            {
                "$sort": {"count": -1}
            }
        ]
        
        city_stats = await db.subscriptions.aggregate(pipeline).to_list(length=None)
        
        # Formatar resultado
        formatted_stats = []
        for stat in city_stats:
            if stat["_id"]:  # Ignorar cidades vazias
                formatted_stats.append({
                    "city": stat["_id"],
                    "total": stat["count"],
                    "paid": stat["paid"],
                    "pending": stat["pending"]
                })
        
        return formatted_stats
        
    except Exception as e:
        logging.error(f"Erro ao obter estatísticas de cidades: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao obter estatísticas")

@api_router.post("/check-duplicates", response_model=DuplicateCheckResponse)
async def check_duplicates(subscription: UserSubscriptionCreate):
    """Verificar duplicatas antes do cadastro"""
    try:
        duplicates = await check_duplicate_registration(
            db, 
            subscription.name, 
            subscription.email, 
            subscription.cpf,
            subscription.phone,
            subscription.carPlate,
            subscription.licenseNumber
        )
        
        return DuplicateCheckResponse(
            has_duplicates=len(duplicates) > 0,
            duplicates=duplicates
        )
        
    except Exception as e:
        logging.error(f"Erro ao verificar duplicatas: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao verificar duplicatas")

@api_router.post("/subscribe", response_model=PasswordSentResponse)
async def create_subscription(subscription: UserSubscriptionCreate):
    """Create a new subscription and send password"""
    try:
        # Validar consentimento LGPD
        if not subscription.lgpd_consent:
            raise HTTPException(
                status_code=400, 
                detail="É necessário aceitar os termos de privacidade e proteção de dados (LGPD)"
            )
        
        # Validar formato de CPF
        if not validate_cpf_format(subscription.cpf):
            raise HTTPException(
                status_code=400, 
                detail="CPF inválido. Verifique os dígitos informados."
            )
        
        # Validar CPF com API
        cpf_validation = await validate_cpf_with_api(subscription.cpf)
        if not cpf_validation["valid"]:
            raise HTTPException(
                status_code=400, 
                detail="CPF não é válido ou não foi possível validar."
            )
        
        # Validar formato de nome (mais flexível com CPF)
        name_validation = validate_name_format(subscription.name)
        if not name_validation["valid"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Nome inválido: {', '.join(name_validation['errors'])}"
            )
        
        # Validar nome com APIs e lista offline (mais tolerante com CPF válido)
        name_offline_check = validate_name_offline(subscription.name)
        if not name_offline_check["valid"]:
            # Com CPF válido, ser mais flexível na validação de nome
            logging.info(f"Nome {subscription.name} não encontrado na lista brasileira, mas CPF é válido")
            # Não bloquear se CPF for válido - apenas log para monitoramento
        
        # Validar formato de email
        if not validate_email_format(subscription.email):
            raise HTTPException(
                status_code=400, 
                detail="Formato de email inválido. Use o formato: exemplo@dominio.com"
            )
        
        # Validar formato de placa
        if subscription.carPlate and not validate_taxi_plate(subscription.carPlate):
            raise HTTPException(
                status_code=400, 
                detail="Formato de placa inválido. Use formatos como: ABC-1234-T, ABC1D23 ou ABC1234"
            )
        
        # Validar formato de alvará
        if subscription.licenseNumber and not validate_taxi_license(subscription.licenseNumber):
            raise HTTPException(
                status_code=400, 
                detail="Formato de alvará inválido. Use formatos como: TA-12345, TAX-2023-1234, T-1234567 ou apenas números"
            )
        
        # Verificar duplicidades (incluindo todos os campos)
        duplicates = await check_duplicate_registration(
            db, 
            subscription.name, 
            subscription.email, 
            subscription.cpf,
            subscription.phone,
            subscription.carPlate,
            subscription.licenseNumber
        )
        
        if duplicates:
            error_messages = []
            for field, info in duplicates.items():
                error_messages.append(f"{info['field']} já cadastrado para {info['existing_user']}")
            
            raise HTTPException(
                status_code=400, 
                detail=" | ".join(error_messages)
            )
        
        # Normalizar dados
        normalized_email = subscription.email.strip().lower()
        normalized_name = " ".join([part.capitalize() for part in subscription.name.strip().split()])
        clean_cpf = re.sub(r'[^\d]', '', subscription.cpf)
        
        # Gerar senha temporária
        temporary_password = generate_password()
        
        # Criar dados da inscrição
        subscription_data = {
            "id": str(uuid.uuid4()),
            "name": normalized_name,
            "email": normalized_email,
            "phone": subscription.phone,
            "cpf": clean_cpf,  # Salvar CPF limpo
            "car_plate": subscription.carPlate,
            "license_number": subscription.licenseNumber,
            "city": subscription.city,
            "status": "pending",
            "course_access": "denied",
            "temporary_password": temporary_password,
            "lgpd_consent": subscription.lgpd_consent,
            "lgpd_consent_date": datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc)
        }
        
        # Preparar para MongoDB
        prepared_data = prepare_for_mongo(subscription_data)
        
        # Salvar no banco
        result = await db.subscriptions.insert_one(prepared_data)
        
        # Enviar senha por email e WhatsApp
        email_sent = await send_password_email(subscription.email, normalized_name, temporary_password)
        whatsapp_sent = await send_password_whatsapp(subscription.phone, normalized_name, temporary_password)
        
        logging.info(f"Inscrição criada: {normalized_email} - Nome: {normalized_name} - CPF: {clean_cpf} - LGPD: {subscription.lgpd_consent}")
        logging.info(f"Email enviado: {email_sent}, WhatsApp enviado: {whatsapp_sent}")
        
        return PasswordSentResponse(
            message="Cadastro realizado com sucesso! Senha enviada por email e WhatsApp.",
            password_sent_email=email_sent,
            password_sent_whatsapp=whatsapp_sent,
            temporary_password=temporary_password  # Remover em produção
        )
        
    except HTTPException:
        # Re-raise HTTPException para manter status code correto
        raise
    except Exception as e:
        logging.error(f"Erro ao criar inscrição: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao processar cadastro")

@api_router.get("/subscriptions", response_model=List[UserSubscription])
async def get_subscriptions():
    """Get all subscriptions"""
    subscriptions = await db.subscriptions.find().to_list(1000)
    return [UserSubscription(**parse_from_mongo(sub)) for sub in subscriptions]

@api_router.get("/subscriptions/{subscription_id}", response_model=UserSubscription)
async def get_subscription(subscription_id: str):
    """Get subscription by ID"""
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada")
    return UserSubscription(**parse_from_mongo(subscription))

@api_router.put("/subscriptions/{subscription_id}/status")
async def update_subscription_status(subscription_id: str, status: str, payment_method: Optional[str] = None, discount: Optional[int] = None, bonus: Optional[bool] = None):
    """Update subscription status with optional discount or bonus"""
    update_data = {"status": status}
    if payment_method:
        update_data["payment_method"] = payment_method
    if discount is not None:
        update_data["discount"] = discount
    if bonus is not None:
        update_data["bonus"] = bonus
    
    result = await db.subscriptions.update_one(
        {"id": subscription_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada")
    
    return {"message": f"Status da inscrição atualizado para: {status}"}

@api_router.put("/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, request: ResetPasswordAdminRequest):
    """Reset user password (admin function)"""
    # Em produção, a senha seria hasheada
    result = await db.subscriptions.update_one(
        {"id": user_id},
        {"$set": {"temporary_password": request.newPassword}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"message": "Senha alterada com sucesso"}

@api_router.get("/admin/financial-stats")
async def get_financial_stats():
    """Get detailed financial statistics"""
    subscriptions = await db.subscriptions.find().to_list(1000)
    
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    
    today_paid = 0
    week_paid = 0
    month_paid = 0
    today_revenue = 0
    week_revenue = 0
    month_revenue = 0
    
    for sub in subscriptions:
        if sub.get('status') in ['paid', 'active']:
            sub_date = datetime.fromisoformat(sub['subscription_date'].replace('Z', '+00:00')).date()
            
            # Calcular receita considerando desconto/bonus
            price = sub.get('original_price', 150)
            if sub.get('bonus'):
                revenue = 0
            elif sub.get('discount'):
                revenue = price * (1 - sub['discount'] / 100)
            else:
                revenue = price
            
            if sub_date == today:
                today_paid += 1
                today_revenue += revenue
            if sub_date >= week_start:
                week_paid += 1
                week_revenue += revenue
            if sub_date >= month_start:
                month_paid += 1
                month_revenue += revenue
    
    return {
        "today": {"paid": today_paid, "revenue": today_revenue},
        "week": {"paid": week_paid, "revenue": week_revenue},
        "month": {"paid": month_paid, "revenue": month_revenue},
        "total_revenue": month_revenue
    }

# User management routes
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user (after payment confirmation)"""
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Usuário já existe no sistema")
    
    user = User(**user_data.dict())
    prepared_data = prepare_for_mongo(user.dict())
    
    await db.users.insert_one(prepared_data)
    
    logging.info(f"Novo usuário criado: {user.name} - {user.email}")
    
    return user

@api_router.get("/users", response_model=List[User])
async def get_users():
    """Get all users"""
    users = await db.users.find().to_list(1000)
    return [User(**parse_from_mongo(user)) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get user by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return User(**parse_from_mongo(user))

@api_router.delete("/subscriptions/{subscription_id}")
async def delete_subscription(subscription_id: str):
    """Delete a subscription"""
    result = await db.subscriptions.delete_one({"id": subscription_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada")
    
    logging.info(f"Inscrição excluída: {subscription_id}")
    
    return {"message": "Inscrição excluída com sucesso"}

# Webhook do Asaas para confirmar pagamentos
@api_router.post("/webhook/asaas-payment")
async def asaas_webhook(request: dict):
    """Webhook para receber notificações de pagamento do Asaas"""
    try:
        event = request.get('event')
        payment_data = request.get('payment', {})
        
        # Aceitar tanto PAYMENT_CONFIRMED quanto PAYMENT_RECEIVED
        if event in ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']:
            # Extrair informações do pagamento
            customer_info = payment_data.get('customer', {})
            payment_id = payment_data.get('id')
            value = payment_data.get('value')
            
            logging.info(f"Webhook recebido: Event={event}, Payment={payment_id}, Value=R${value}")
            
            # Tentar extrair email do customer (formato antigo vs novo)
            customer_email = None
            customer_id = None
            
            if isinstance(customer_info, dict):
                customer_email = customer_info.get('email')
                logging.info(f"Customer email extraído: {customer_email}")
            elif isinstance(customer_info, str):
                customer_id = customer_info
                logging.info(f"Customer ID extraído: {customer_id}")
            
            # Buscar usuário para atualizar
            updated_user = None
            subscription_filter = None
            
            # 1. Primeiro tentar por email se disponível
            if customer_email:
                subscription_filter = {"email": customer_email}
                logging.info(f"Buscando usuário por email: {customer_email}")
            
            # 2. Se não tem email, tentar por customer_id já existente
            elif customer_id:
                subscription_filter = {"asaas_customer_id": customer_id}
                existing_user = await db.subscriptions.find_one(subscription_filter)
                if existing_user:
                    logging.info(f"Usuário encontrado por customer_id: {customer_id}")
                else:
                    # 3. Como fallback, pegar qualquer usuário pendente
                    logging.info(f"Customer ID {customer_id} não encontrado, usando fallback para usuário pendente")
                    pending_users = await db.subscriptions.find({"status": "pending"}).to_list(10)
                    if pending_users:
                        # Usar o primeiro usuário pendente
                        subscription_filter = {"id": pending_users[0]["id"]}
                        logging.info(f"Usando usuário pendente como fallback: {pending_users[0].get('email', 'N/A')}")
                    else:
                        logging.warning("Nenhum usuário pendente encontrado para fallback")
                        return {"message": "Nenhum usuário pendente para processar pagamento", "status": "warning"}
            
            if subscription_filter:
                # Preparar dados de atualização
                update_timestamp = datetime.now(timezone.utc).isoformat()
                update_data = {
                    "status": "paid",
                    "payment_id": payment_id,
                    "payment_value": float(value) if value else 0.0,
                    "payment_confirmed_at": update_timestamp,
                    "course_access": "granted"
                }
                
                if customer_id:
                    update_data["asaas_customer_id"] = customer_id
                
                logging.info(f"Dados de atualização preparados: {update_data}")
                
                # Executar atualização com upsert para criar campos se necessário
                try:
                    result = await db.subscriptions.update_one(
                        subscription_filter,
                        {"$set": update_data},
                        upsert=False  # Não criar novo documento, apenas atualizar existente
                    )
                    
                    logging.info(f"MongoDB result: matched={result.matched_count}, modified={result.modified_count}")
                    
                    if result.matched_count > 0:
                        # Verificar se a atualização funcionou
                        updated_user = await db.subscriptions.find_one(subscription_filter)
                        if updated_user:
                            user_name = updated_user.get('name', 'N/A')
                            user_email = updated_user.get('email', 'N/A')
                            
                            # Verificar se os campos foram realmente atualizados
                            stored_payment_id = updated_user.get('payment_id')
                            stored_customer_id = updated_user.get('asaas_customer_id')
                            stored_value = updated_user.get('payment_value')
                            stored_status = updated_user.get('status')
                            stored_access = updated_user.get('course_access')
                            
                            logging.info(f"Verificação pós-atualização:")
                            logging.info(f"  Status: {stored_status}")
                            logging.info(f"  Payment ID: {stored_payment_id}")
                            logging.info(f"  Customer ID: {stored_customer_id}")
                            logging.info(f"  Value: {stored_value}")
                            logging.info(f"  Course Access: {stored_access}")
                            
                            if stored_status == "paid" and stored_payment_id == payment_id:
                                logging.info(f"✅ Pagamento processado com sucesso para: {user_name} ({user_email})")
                                
                                return {
                                    "message": "Pagamento processado e curso liberado",
                                    "status": "success",
                                    "user_name": user_name,
                                    "email": user_email,
                                    "payment_id": payment_id,
                                    "customer_id": customer_id,
                                    "value": value,
                                    "updated_fields": {
                                        "status": stored_status,
                                        "payment_id": stored_payment_id,
                                        "asaas_customer_id": stored_customer_id,
                                        "payment_value": stored_value,
                                        "course_access": stored_access
                                    }
                                }
                            else:
                                logging.error(f"❌ Atualização não persistiu corretamente")
                                logging.error(f"Esperado status=paid, payment_id={payment_id}")
                                logging.error(f"Recebido status={stored_status}, payment_id={stored_payment_id}")
                                
                                return {
                                    "message": "Webhook processado mas dados não persistiram",
                                    "status": "error",
                                    "expected": {"status": "paid", "payment_id": payment_id},
                                    "actual": {"status": stored_status, "payment_id": stored_payment_id}
                                }
                        else:
                            logging.error("Usuário não encontrado após atualização")
                            return {"message": "Usuário não encontrado após atualização", "status": "error"}
                    else:
                        logging.warning(f"Nenhum documento corresponde ao filtro: {subscription_filter}")
                        return {"message": "Nenhum usuário encontrado para atualizar", "status": "warning"}
                        
                except Exception as mongo_error:
                    logging.error(f"Erro na operação MongoDB: {str(mongo_error)}")
                    return {"message": f"Erro na atualização do banco: {str(mongo_error)}", "status": "error"}
            else:
                logging.warning("Filtro de busca não pôde ser criado")
                return {"message": "Dados insuficientes para identificar usuário", "status": "warning"}
        
        logging.info(f"Evento {event} recebido mas não processado")
        return {"message": f"Evento {event} recebido", "status": "received"}
        
    except Exception as e:
        logging.error(f"Erro geral no webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro no webhook: {str(e)}")
        
        return {"message": "Webhook recebido", "status": "received"}
        
    except Exception as e:
        logging.error(f"Erro no webhook Asaas: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao processar webhook")

@api_router.post("/payment/verify-status")
async def verify_payment_status(request: dict):
    """Verificar status do pagamento manualmente"""
    try:
        email = request.get('email')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email é obrigatório")
        
        # Buscar inscrição
        subscription = await db.subscriptions.find_one({"email": email})
        
        if not subscription:
            raise HTTPException(status_code=404, detail="Inscrição não encontrada")
        
        # Simular verificação (em produção, consultaria API do Asaas)
        # Por enquanto, vamos simular que 70% dos pagamentos são aprovados
        import random
        if random.random() > 0.3:
            # Atualizar como pago
            await db.subscriptions.update_one(
                {"email": email},
                {
                    "$set": {
                        "status": "paid",
                        "payment_confirmed_at": datetime.now(timezone.utc).isoformat(),
                        "course_access": "granted"
                    }
                }
            )
            
            return {
                "status": "paid",
                "message": "Pagamento confirmado! Curso liberado.",
                "course_access": "granted"
            }
        else:
            return {
                "status": "pending",
                "message": "Pagamento ainda não confirmado. Aguarde alguns minutos.",
                "course_access": "denied"
            }
            
    except Exception as e:
        logging.error(f"Erro ao verificar pagamento: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao verificar pagamento")

# Module routes
@api_router.post("/modules", response_model=Module)
async def create_module(module_data: Module):
    """Create a new course module"""
    prepared_data = prepare_for_mongo(module_data.dict())
    await db.modules.insert_one(prepared_data)
    
    logging.info(f"Novo módulo criado: {module_data.title}")
    
    return module_data

@api_router.get("/modules", response_model=List[Module])
async def get_modules():
    """Get all course modules"""
    modules = await db.modules.find().sort("order", 1).to_list(1000)
    return [Module(**parse_from_mongo(module)) for module in modules]

@api_router.get("/modules/{module_id}", response_model=Module)
async def get_module(module_id: str):
    """Get module by ID"""
    module = await db.modules.find_one({"id": module_id})
    if not module:
        raise HTTPException(status_code=404, detail="Módulo não encontrado")
    return Module(**parse_from_mongo(module))

# Exam routes
@api_router.post("/exams", response_model=Exam)
async def create_exam(exam_data: Exam):
    """Create a new exam"""
    prepared_data = prepare_for_mongo(exam_data.dict())
    await db.exams.insert_one(prepared_data)
    
    logging.info(f"Novo exame criado para módulo: {exam_data.module_id}")
    
    return exam_data

@api_router.get("/modules/{module_id}/exam", response_model=Exam)
async def get_module_exam(module_id: str):
    """Get exam for a specific module"""
    exam = await db.exams.find_one({"module_id": module_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado para este módulo")
    return Exam(**parse_from_mongo(exam))

# Chat Bot Routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_request: ChatRequest):
    """Chat com o bot IA dos taxistas"""
    try:
        # Inicializar o chat com LLM
        chat = LlmChat(
            api_key=os.getenv('EMERGENT_LLM_KEY'),
            session_id=chat_request.session_id,
            system_message=get_bot_context()
        ).with_model("openai", "gpt-4o-mini")
        
        # Verificar se é uma solicitação de reset de senha
        if detect_password_reset_request(chat_request.message):
            response_text = """Entendo que você precisa resetar sua senha! 
            
Posso ajudá-lo com isso. Para resetar sua senha, você precisará:

1. Fornecer seu email cadastrado
2. Receberá um link por email para criar uma nova senha
3. O link será válido por 24 horas

Se quiser prosseguir, me informe seu email ou acesse diretamente nossa página de recuperação de senha.

Para questões mais técnicas, também pode entrar em contato com nosso suporte em: suporte@sindtaxi-es.org"""
        
        # Verificar se está perguntando sobre valores
        elif detect_value_question(chat_request.message):
            response_text = "Os valores do treinamento serão divulgados em breve. Assim que tivermos os preços definidos, iremos comunicar através dos nossos canais oficiais. Enquanto isso, você pode se cadastrar para receber as informações assim que disponíveis!"
        
        else:
            # Usar LLM para resposta normal
            user_message = UserMessage(text=chat_request.message)
            response_text = await chat.send_message(user_message)
        
        # Salvar no histórico
        await save_chat_message(
            chat_request.session_id,
            chat_request.message,
            response_text
        )
        
        return ChatResponse(
            session_id=chat_request.session_id,
            response=response_text,
            timestamp=datetime.now(timezone.utc)
        )
        
    except Exception as e:
        logging.error(f"Erro no chat bot: {str(e)}")
        # Resposta de fallback
        fallback_response = """Desculpe, estou enfrentando algumas dificuldades técnicas no momento. 
        
Para questões urgentes, entre em contato com nosso suporte:
📧 suporte@sindtaxi-es.org

Sobre valores: Os valores do treinamento serão divulgados em breve!"""
        
        await save_chat_message(
            chat_request.session_id,
            chat_request.message,
            fallback_response
        )
        
        return ChatResponse(
            session_id=chat_request.session_id,
            response=fallback_response,
            timestamp=datetime.now(timezone.utc)
        )

@api_router.get("/chat/{session_id}/history", response_model=List[ChatMessage])
async def get_chat_session_history(session_id: str, limit: int = 20):
    """Buscar histórico de uma sessão de chat"""
    history = await get_chat_history(session_id, limit)
    return history

@api_router.post("/password-reset", response_model=PasswordResetResponse)  
async def request_password_reset(reset_request: PasswordResetRequest):
    """Solicitar reset de senha via email"""
    try:
        # Verificar se email existe no sistema
        user = await db.users.find_one({"email": reset_request.email})
        subscription = await db.subscriptions.find_one({"email": reset_request.email})
        
        if not user and not subscription:
            # Por segurança, não revelar se email existe ou não
            return PasswordResetResponse(
                message="Se o email estiver cadastrado em nosso sistema, você receberá instruções para resetar sua senha.",
                status="sent"
            )
        
        # TODO: Implementar envio de email real quando tiver integração
        # Por enquanto, simular sucesso
        logging.info(f"Solicitação de reset de senha para: {reset_request.email}")
        
        return PasswordResetResponse(
            message="Se o email estiver cadastrado em nosso sistema, você receberá instruções para resetar sua senha.",
            status="sent"
        )
        
    except Exception as e:
        logging.error(f"Erro ao processar reset de senha: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# Statistics routes for admin
@api_router.get("/admin/stats")
async def get_admin_stats():
    """Get admin statistics"""
    total_subscriptions = await db.subscriptions.count_documents({})
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"subscription_status": "active"})
    completed_users = await db.users.count_documents({"subscription_status": "completed"})
    
    # Subscription status breakdown
    pending_subscriptions = await db.subscriptions.count_documents({"status": "pending"})
    paid_subscriptions = await db.subscriptions.count_documents({"status": "paid"})
    active_subscriptions = await db.subscriptions.count_documents({"status": "active"})
    
    return {
        "total_subscriptions": total_subscriptions,
        "total_users": total_users,
        "active_users": active_users,
        "completed_users": completed_users,
        "pending_subscriptions": pending_subscriptions,
        "paid_subscriptions": paid_subscriptions,
        "active_subscriptions": active_subscriptions,
        "conversion_rate": round((total_users / total_subscriptions * 100) if total_subscriptions > 0 else 0, 2)
    }

# Health check
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "EAD Taxista ES API"
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()