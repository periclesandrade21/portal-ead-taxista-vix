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
def generate_password(length=8):
    """Gera uma senha aleatória"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

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
        # Configurações do email (usando Gmail como exemplo)
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = "suporte@sindtaxi-es.org"  # Você precisará configurar isso
        sender_password = os.environ.get('EMAIL_PASSWORD', '')  # Adicione no .env
        
        # Criar mensagem
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = email
        message["Subject"] = "Sua senha de acesso - EAD Taxista ES"
        
        body = f"""
        Olá {name},
        
        Seu cadastro foi realizado com sucesso!
        
        Sua senha temporária de acesso é: {password}
        
        Você pode usar esta senha para acessar o portal do aluno após a confirmação do pagamento.
        
        Atenciosamente,
        Equipe EAD Taxista ES
        Sindicato dos Taxistas do Espírito Santo
        """
        
        message.attach(MIMEText(body, "plain"))
        
        # Enviar email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = message.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        
        return True
    except Exception as e:
        logging.error(f"Erro ao enviar email: {str(e)}")
        return False

async def send_password_whatsapp(phone: str, name: str, password: str):
    """Envia senha por WhatsApp - Simulado por enquanto"""
    try:
        # Por enquanto, vamos simular o envio
        # Em produção, você integraria com API do WhatsApp Business ou similar
        logging.info(f"WhatsApp enviado para {phone}: Senha {password}")
        
        # Simular sucesso (70% de sucesso)
        import random
        return random.random() > 0.3
    except Exception as e:
        logging.error(f"Erro ao enviar WhatsApp: {str(e)}")
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

@api_router.post("/subscribe", response_model=PasswordSentResponse)
async def create_subscription(subscription: UserSubscriptionCreate):
    """Create a new subscription and send password"""
    try:
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
        
        # Verificar duplicidades (incluindo CPF)
        duplicates = await check_duplicate_registration(db, subscription.name, subscription.email, subscription.cpf)
        
        if duplicates:
            error_messages = []
            if duplicates.get("email"):
                error_messages.append("Email já cadastrado no sistema")
            if duplicates.get("cpf"):
                error_messages.append("CPF já cadastrado no sistema")
            if duplicates.get("name"):
                error_messages.append("Nome já cadastrado no sistema")
            
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
            "created_at": datetime.now(timezone.utc)
        }
        
        # Preparar para MongoDB
        prepared_data = prepare_for_mongo(subscription_data)
        
        # Salvar no banco
        result = await db.subscriptions.insert_one(prepared_data)
        
        # Enviar senha por email e WhatsApp
        email_sent = await send_password_email(subscription.email, normalized_name, temporary_password)
        whatsapp_sent = await send_password_whatsapp(subscription.phone, normalized_name, temporary_password)
        
        logging.info(f"Inscrição criada: {normalized_email} - Nome: {normalized_name} - CPF: {clean_cpf}")
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
async def reset_user_password(user_id: str, new_password: str):
    """Reset user password (admin function)"""
    # Em produção, a senha seria hasheada
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"password": new_password}}  # Em produção: hash(new_password)
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
        
        if event == 'PAYMENT_CONFIRMED':
            # Extrair informações do pagamento
            customer_email = payment_data.get('customer', {}).get('email')
            payment_id = payment_data.get('id')
            value = payment_data.get('value')
            
            logging.info(f"Pagamento confirmado via Asaas: {payment_id} - {customer_email} - R$ {value}")
            
            # Atualizar status da inscrição
            if customer_email:
                result = await db.subscriptions.update_one(
                    {"email": customer_email},
                    {
                        "$set": {
                            "status": "paid",
                            "payment_id": payment_id,
                            "payment_confirmed_at": datetime.now(timezone.utc).isoformat(),
                            "course_access": "granted"
                        }
                    }
                )
                
                if result.matched_count > 0:
                    logging.info(f"Curso liberado para: {customer_email}")
                    
                    # Aqui você pode adicionar lógica adicional:
                    # - Enviar email de confirmação
                    # - Criar usuário no Moodle
                    # - Notificar admin
                    
                    return {"message": "Pagamento processado e curso liberado", "status": "success"}
                else:
                    logging.warning(f"Inscrição não encontrada para email: {customer_email}")
                    return {"message": "Inscrição não encontrada", "status": "warning"}
        
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