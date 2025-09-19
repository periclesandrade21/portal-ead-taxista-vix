"""
Script para popular o banco de dados com os módulos, vídeos e questões do curso EAD
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid

# Configuração do banco
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

# Dados dos módulos
MODULES_DATA = [
    {
        "id": str(uuid.uuid4()),
        "title": "Mecânica Básica",
        "description": "Curso Básico de Mecânica Automotiva - Fundamentos essenciais para taxistas",
        "order": 1,
        "duration_hours": 4,
        "color": "#ef4444",
        "content": "Conteúdo completo sobre mecânica básica automotiva, incluindo funcionamento do motor, sistemas de arrefecimento, lubrificação e manutenção preventiva.",
        "is_mandatory": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Legislação de Trânsito",
        "description": "Curso Legislação 2025 - Atualizações e normas vigentes",
        "order": 2,
        "duration_hours": 8,
        "color": "#3b82f6",
        "content": "Estudo completo da legislação de trânsito brasileira, incluindo CTB, infrações, penalidades e direção defensiva.",
        "is_mandatory": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Primeiros Socorros",
        "description": "Definindo Primeiros Socorros - Técnicas essenciais de atendimento de emergência",
        "order": 3,
        "duration_hours": 2,
        "color": "#10b981",
        "content": "Técnicas fundamentais de primeiros socorros, RCP, controle de hemorragias e atendimento a vítimas de acidentes.",
        "is_mandatory": True,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Relações Humanas",
        "description": "Atendimento ao cliente e relacionamento interpessoal no transporte",
        "order": 4,
        "duration_hours": 14,
        "color": "#8b5cf6",
        "content": "Desenvolvimento de habilidades interpessoais, atendimento ao cliente, comunicação eficaz e ética profissional no transporte de passageiros.",
        "is_mandatory": True,
        "created_at": datetime.now(timezone.utc)
    }
]

def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from URL"""
    import re
    patterns = [
        r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([^&\n]+)',
        r'(?:https?://)?(?:www\.)?youtube\.com/embed/([^&\n]+)',
        r'(?:https?://)?(?:www\.)?youtu\.be/([^&\n]+)',
        r'(?:https?://)?(?:www\.)?youtube\.com/v/([^&\n]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return ""

def get_youtube_thumbnail(video_id: str) -> str:
    """Get YouTube thumbnail URL"""
    return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"

# Dados dos vídeos
VIDEOS_DATA = [
    # Mecânica Básica
    {
        "title": "Fundamentos da Mecânica Automotiva",
        "youtube_url": "https://www.youtube.com/watch?v=JYQNMqkYa00",
        "module_name": "Mecânica Básica",
        "order": 1,
        "duration_minutes": 15,
        "description": "Introdução aos conceitos básicos da mecânica automotiva"
    },
    {
        "title": "Sistema de Motor - Parte 1",
        "youtube_url": "https://www.youtube.com/watch?v=GVwLWJZ-Muo",
        "module_name": "Mecânica Básica",
        "order": 2,
        "duration_minutes": 18,
        "description": "Funcionamento do motor de combustão interna"
    },
    {
        "title": "Sistema de Motor - Parte 2",
        "youtube_url": "https://www.youtube.com/watch?v=T7pRaG0Vcg8",
        "module_name": "Mecânica Básica",
        "order": 3,
        "duration_minutes": 20,
        "description": "Continuação do estudo dos sistemas do motor"
    },
    {
        "title": "Manutenção Preventiva",
        "youtube_url": "https://www.youtube.com/watch?v=rD-iruNpVaU",
        "module_name": "Mecânica Básica",
        "order": 4,
        "duration_minutes": 22,
        "description": "Como realizar manutenção preventiva no veículo"
    },
    
    # Legislação
    {
        "title": "Legislação de Trânsito 2025",
        "youtube_url": "https://www.youtube.com/watch?v=RtmJhMYhH8s",
        "module_name": "Legislação de Trânsito",
        "order": 1,
        "duration_minutes": 45,
        "description": "Principais mudanças e atualizações na legislação de trânsito para 2025"
    },
    
    # Primeiros Socorros
    {
        "title": "Definindo Primeiros Socorros",
        "youtube_url": "https://www.youtube.com/watch?v=IBUUAMvXVCA",
        "module_name": "Primeiros Socorros",
        "order": 1,
        "duration_minutes": 10,
        "description": "Conceitos básicos e definições de primeiros socorros"
    },
    {
        "title": "Avaliação da Vítima",
        "youtube_url": "https://www.youtube.com/watch?v=6AeWIn_WodM",
        "module_name": "Primeiros Socorros",
        "order": 2,
        "duration_minutes": 12,
        "description": "Como avaliar corretamente uma vítima de acidente"
    },
    {
        "title": "Posicionamento da Vítima",
        "youtube_url": "https://www.youtube.com/watch?v=keJuYD1HKwc",
        "module_name": "Primeiros Socorros",
        "order": 3,
        "duration_minutes": 8,
        "description": "Técnicas corretas de posicionamento de vítimas"
    },
    {
        "title": "Reanimação Cardiopulmonar (RCP)",
        "youtube_url": "https://www.youtube.com/watch?v=bvZlsaOrNho",
        "module_name": "Primeiros Socorros",
        "order": 4,
        "duration_minutes": 15,
        "description": "Técnicas de reanimação cardiopulmonar"
    },
    {
        "title": "Controle de Hemorragias",
        "youtube_url": "https://www.youtube.com/watch?v=d335IZd262o",
        "module_name": "Primeiros Socorros",
        "order": 5,
        "duration_minutes": 10,
        "description": "Como controlar diferentes tipos de hemorragias"
    },
    {
        "title": "Queimaduras e Tratamento",
        "youtube_url": "https://www.youtube.com/watch?v=5ebapE2xjCo",
        "module_name": "Primeiros Socorros",
        "order": 6,
        "duration_minutes": 12,
        "description": "Tratamento adequado para diferentes graus de queimaduras"
    },
    {
        "title": "Fraturas e Imobilização",
        "youtube_url": "https://www.youtube.com/watch?v=_djap5SdSc8",
        "module_name": "Primeiros Socorros",
        "order": 7,
        "duration_minutes": 14,
        "description": "Como identificar e imobilizar fraturas"
    }
]

# Questões por módulo
QUESTIONS_DATA = {
    "Mecânica Básica": {
        "facil": [
            {
                "question": "Qual é a função principal do motor de um veículo?",
                "options": [
                    "Gerar energia elétrica",
                    "Transformar combustível em movimento",
                    "Resfriar o sistema",
                    "Filtrar o ar"
                ],
                "correct_answer": 1,
                "explanation": "O motor transforma a energia química do combustível em energia mecânica, gerando movimento."
            },
            {
                "question": "Com que frequência deve ser verificado o nível de óleo do motor?",
                "options": [
                    "A cada 6 meses",
                    "Apenas quando acende a luz no painel",
                    "Semanalmente ou a cada 1000 km",
                    "Somente na revisão"
                ],
                "correct_answer": 2,
                "explanation": "É recomendado verificar o óleo semanalmente ou a cada 1000 km para garantir o bom funcionamento do motor."
            },
            {
                "question": "Qual a cor ideal do óleo do motor em boas condições?",
                "options": [
                    "Preto",
                    "Amarelo transparente ou âmbar claro",
                    "Verde",
                    "Azul"
                ],
                "correct_answer": 1,
                "explanation": "Óleo em boas condições apresenta cor amarelada transparente ou âmbar claro."
            },
            {
                "question": "O que indica a luz vermelha da temperatura no painel?",
                "options": [
                    "Motor funcionando normalmente",
                    "Falta de combustível",
                    "Superaquecimento do motor",
                    "Problema no sistema elétrico"
                ],
                "correct_answer": 2,
                "explanation": "A luz vermelha de temperatura indica superaquecimento do motor, requiring immediate attention."
            },
            {
                "question": "Qual a função principal do radiador?",
                "options": [
                    "Aquecer o motor",
                    "Resfriar o motor",
                    "Filtrar o combustível",
                    "Gerar energia elétrica"
                ],
                "correct_answer": 1,
                "explanation": "O radiador tem a função de resfriar o motor, dissipando o calor através do líquido de arrefecimento."
            }
        ],
        "media": [
            {
                "question": "Quais são os quatro tempos do motor de combustão interna?",
                "options": [
                    "Admissão, Compressão, Combustão, Escape",
                    "Ignição, Aceleração, Freio, Neutro",
                    "Partida, Aquecimento, Funcionamento, Parada",
                    "Entrada, Mistura, Saída, Limpeza"
                ],
                "correct_answer": 0,
                "explanation": "Os quatro tempos são: Admissão (entrada da mistura), Compressão, Combustão (explosão) e Escape (saída dos gases)."
            },
            {
                "question": "Em caso de superaquecimento, qual é a primeira ação a ser tomada?",
                "options": [
                    "Acelerar o motor para resfriar mais rápido",
                    "Desligar o motor imediatamente e parar em local seguro",
                    "Continuar dirigindo devagar",
                    "Ligar o ar condicionado no máximo"
                ],
                "correct_answer": 1,
                "explanation": "Em caso de superaquecimento, deve-se desligar o motor imediatamente e parar em local seguro para evitar danos maiores."
            },
            {
                "question": "Qual a diferência entre óleo mineral e sintético?",
                "options": [
                    "Não há diferença prática",
                    "Sintético é sempre mais barato",
                    "Sintético oferece maior proteção e durabilidade",
                    "Mineral é mais moderno"
                ],
                "correct_answer": 2,
                "explanation": "Óleo sintético oferece maior proteção, melhor desempenho em temperaturas extremas e maior durabilidade."
            }
        ],
        "dificil": [
            {
                "question": "Qual a relação ideal de compressão para motores flex brasileiros?",
                "options": [
                    "8:1 a 9:1",
                    "10:1 a 12:1",
                    "15:1 a 18:1",
                    "5:1 a 7:1"
                ],
                "correct_answer": 1,
                "explanation": "Motores flex brasileiros geralmente operam com relação de compressão entre 10:1 e 12:1 para otimizar o uso de etanol e gasolina."
            },
            {
                "question": "Em um sistema de injeção eletrônica, o que faz o sensor MAP?",
                "options": [
                    "Mede a rotação do motor",
                    "Controla a temperatura do motor",
                    "Mede a pressão absoluta do coletor de admissão",
                    "Monitora o nível de combustível"
                ],
                "correct_answer": 2,
                "explanation": "O sensor MAP (Manifold Absolute Pressure) mede a pressão absoluta no coletor de admissão, ajudando a calcular a quantidade de combustível necessária."
            }
        ]
    },
    
    "Legislação de Trânsito": {
        "facil": [
            {
                "question": "Qual a velocidade máxima permitida em vias urbanas?",
                "options": [
                    "40 km/h",
                    "50 km/h", 
                    "60 km/h",
                    "70 km/h"
                ],
                "correct_answer": 1,
                "explanation": "Em vias urbanas, a velocidade máxima é 50 km/h, salvo sinalização específica."
            },
            {
                "question": "É obrigatório o uso do cinto de segurança?",
                "options": [
                    "Apenas para o motorista",
                    "Apenas em rodovias",
                    "Para todos os ocupantes do veículo",
                    "Apenas para crianças"
                ],
                "correct_answer": 2,
                "explanation": "O uso do cinto de segurança é obrigatório para todos os ocupantes do veículo."
            },
            {
                "question": "Qual documento é obrigatório para dirigir?",
                "options": [
                    "RG",
                    "CPF",
                    "Carteira Nacional de Habilitação (CNH)",
                    "Certidão de nascimento"
                ],
                "correct_answer": 2,
                "explanation": "A CNH é o documento obrigatório que comprova a habilitação para dirigir."
            },
            {
                "question": "Em cruzamento sem sinalização, quem tem preferência?",
                "options": [
                    "Veículo da esquerda",
                    "Veículo da direita",
                    "Veículo mais rápido",
                    "Veículo maior"
                ],
                "correct_answer": 1,
                "explanation": "Em cruzamentos sem sinalização, tem preferência o veículo que vem da direita."
            },
            {
                "question": "Quantos pontos na CNH causam a suspensão do direito de dirigir?",
                "options": [
                    "15 pontos",
                    "20 pontos",
                    "25 pontos",
                    "30 pontos"
                ],
                "correct_answer": 1,
                "explanation": "Com 20 pontos na CNH, o condutor tem o direito de dirigir suspenso."
            }
        ],
        "media": [
            {
                "question": "Qual infração é considerada gravíssima?",
                "options": [
                    "Estacionar em local proibido",
                    "Dirigir sob efeito de álcool",
                    "Não usar seta",
                    "Excesso de velocidade até 20%"
                ],
                "correct_answer": 1,
                "explanation": "Dirigir sob efeito de álcool é infração gravíssima, com multa, suspensão da CNH e retenção do veículo."
            },
            {
                "question": "Em caso de acidente com vítima, qual a primeira providência?",
                "options": [
                    "Fotografar os danos",
                    "Acionar o seguro",
                    "Prestar socorro às vítimas",
                    "Remover o veículo da via"
                ],
                "correct_answer": 2,
                "explanation": "A primeira providência é prestar socorro às vítimas, conforme determina o CTB."
            },
            {
                "question": "O que caracteriza direção defensiva?",
                "options": [
                    "Dirigir sempre devagar",
                    "Antecipar situações de risco e agir preventivamente",
                    "Usar sempre buzina",
                    "Manter distância mínima de 50 metros"
                ],
                "correct_answer": 1,
                "explanation": "Direção defensiva é antecipar, reconhecer e evitar situações de risco no trânsito."
            }
        ],
        "dificil": [
            {
                "question": "Segundo o CTB, qual a distância mínima para ultrapassagem em rodovias?",
                "options": [
                    "Não há distância mínima especificada",
                    "100 metros de visibilidade livre",
                    "200 metros de visibilidade livre", 
                    "300 metros de visibilidade livre"
                ],
                "correct_answer": 2,
                "explanation": "Para ultrapassagem em rodovias, é necessário ter pelo menos 200 metros de visibilidade livre da via."
            },
            {
                "question": "Em que situações é permitido trafegar no acostamento?",
                "options": [
                    "Quando há congestionamento",
                    "Apenas em emergências ou por orientação da autoridade",
                    "Para ultrapassagens rápidas",
                    "Nunca é permitido"
                ],
                "correct_answer": 1,
                "explanation": "O acostamento só pode ser usado em emergências ou quando orientado pela autoridade de trânsito."
            }
        ]
    },
    
    "Primeiros Socorros": {
        "facil": [
            {
                "question": "Qual o número do SAMU?",
                "options": [
                    "190",
                    "192",
                    "193",
                    "194"
                ],
                "correct_answer": 1,
                "explanation": "O SAMU (Serviço de Atendimento Móvel de Urgência) atende pelo número 192."
            },
            {
                "question": "Em caso de sangramento intenso, o que fazer primeiro?",
                "options": [
                    "Aplicar torniquete",
                    "Pressionar o ferimento com tecido limpo",
                    "Dar água para a vítima",
                    "Movimentar a vítima"
                ],
                "correct_answer": 1,
                "explanation": "Deve-se pressionar o ferimento com tecido limpo para controlar o sangramento."
            },
            {
                "question": "Uma pessoa desmaiada deve ser colocada em que posição?",
                "options": [
                    "Sentada",
                    "De lado (posição lateral de segurança)",
                    "De cabeça para baixo",
                    "Em pé"
                ],
                "correct_answer": 1,
                "explanation": "A posição lateral de segurança previne engasgamento e mantém as vias aéreas livres."
            },
            {
                "question": "Em caso de queimadura, o que NÃO se deve fazer?",
                "options": [
                    "Aplicar água fria",
                    "Cobrir com tecido limpo",
                    "Aplicar pasta de dente ou manteiga",
                    "Procurar atendimento médico"
                ],
                "correct_answer": 2,
                "explanation": "Nunca aplicar pasta de dente, manteiga ou outros produtos caseiros em queimaduras."
            },
            {
                "question": "Ao encontrar uma vítima inconsciente, o que verificar primeiro?",
                "options": [
                    "Se está respirando",
                    "Se tem ferimentos visíveis",
                    "Se tem pulso",
                    "Se responde a estímulos"
                ],
                "correct_answer": 0,
                "explanation": "Primeiro deve-se verificar se a vítima está respirando para determinar se precisa de RCP."
            }
        ],
        "media": [
            {
                "question": "Qual a sequência correta da RCP (Reanimação Cardiopulmonar)?",
                "options": [
                    "2 ventilações, 30 compressões",
                    "30 compressões, 2 ventilações",
                    "15 compressões, 1 ventilação",
                    "1 ventilação, 15 compressões"
                ],
                "correct_answer": 1,
                "explanation": "A sequência correta é 30 compressões torácicas seguidas de 2 ventilações."
            },
            {
                "question": "Em caso de fratura exposta, qual a conduta correta?",
                "options": [
                    "Tentar recolocar o osso no lugar",
                    "Imobilizar sem tentar reposicionar, controlando o sangramento",
                    "Movimentar a vítima imediatamente",
                    "Aplicar gelo diretamente no ferimento"
                ],
                "correct_answer": 1,
                "explanation": "Em fraturas expostas, deve-se imobilizar sem reposicionar e controlar o sangramento."
            },
            {
                "question": "Qual a frequência ideal de compressões no RCP adulto?",
                "options": [
                    "60 a 80 por minuto",
                    "100 a 120 por minuto",
                    "140 a 160 por minuto",
                    "200 ou mais por minuto"
                ],
                "correct_answer": 1,
                "explanation": "A frequência ideal é entre 100 a 120 compressões por minuto em adultos."
            }
        ],
        "dificil": [
            {
                "question": "Em caso de suspeita de lesão na coluna vertebral, qual a técnica correta para movimentar a vítima?",
                "options": [
                    "Movimentar normalmente",
                    "Técnica de rolamento em bloco com múltiplas pessoas",
                    "Sentar a vítima devagar",
                    "Virar apenas a cabeça"
                ],
                "correct_answer": 1,
                "explanation": "Suspeita de lesão na coluna requer técnica de rolamento em bloco com múltiplas pessoas para manter alinhamento."
            },
            {
                "question": "Qual a profundidade correta das compressões torácicas em adultos?",
                "options": [
                    "2-3 cm",
                    "3-4 cm",
                    "5-6 cm",
                    "7-8 cm"
                ],
                "correct_answer": 2,
                "explanation": "As compressões devem ter profundidade de 5-6 cm em adultos para ser efetiva."
            }
        ]
    }
}

async def seed_database():
    """Popula o banco de dados com os dados iniciais"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🌱 Iniciando população do banco de dados...")
    
    try:
        # Limpar collections existentes
        await db.course_modules.delete_many({})
        await db.course_videos.delete_many({})
        await db.questions.delete_many({})
        
        print("✅ Collections limpas")
        
        # Inserir módulos
        await db.course_modules.insert_many(MODULES_DATA)
        print(f"✅ {len(MODULES_DATA)} módulos inseridos")
        
        # Mapear nomes de módulos para IDs
        module_map = {}
        for module in MODULES_DATA:
            module_map[module["title"]] = module["id"]
        
        # Inserir vídeos
        videos_to_insert = []
        for video_data in VIDEOS_DATA:
            youtube_id = extract_youtube_id(video_data["youtube_url"])
            module_id = module_map[video_data["module_name"]]
            
            video = {
                "id": str(uuid.uuid4()),
                "title": video_data["title"],
                "description": video_data["description"],
                "youtube_url": video_data["youtube_url"],
                "youtube_id": youtube_id,
                "module_id": module_id,
                "order": video_data["order"],
                "duration_minutes": video_data["duration_minutes"],
                "thumbnail_url": get_youtube_thumbnail(youtube_id),
                "created_at": datetime.now(timezone.utc),
                "created_by": "system"
            }
            videos_to_insert.append(video)
        
        await db.course_videos.insert_many(videos_to_insert)
        print(f"✅ {len(videos_to_insert)} vídeos inseridos")
        
        # Inserir questões
        questions_to_insert = []
        for module_name, difficulties in QUESTIONS_DATA.items():
            module_id = module_map[module_name]
            
            for difficulty, questions in difficulties.items():
                for question_data in questions:
                    question = {
                        "id": str(uuid.uuid4()),
                        "module_id": module_id,
                        "question": question_data["question"],
                        "options": question_data["options"],
                        "correct_answer": question_data["correct_answer"],
                        "difficulty": difficulty,
                        "explanation": question_data["explanation"],
                        "created_at": datetime.now(timezone.utc)
                    }
                    questions_to_insert.append(question)
        
        await db.questions.insert_many(questions_to_insert)
        print(f"✅ {len(questions_to_insert)} questões inseridas")
        
        print("\n🎉 Banco de dados populado com sucesso!")
        print("\n📊 Resumo:")
        print(f"  • {len(MODULES_DATA)} módulos")
        print(f"  • {len(videos_to_insert)} vídeos")
        print(f"  • {len(questions_to_insert)} questões")
        
        # Estatísticas por módulo
        print("\n📚 Por módulo:")
        for module in MODULES_DATA:
            video_count = len([v for v in VIDEOS_DATA if v["module_name"] == module["title"]])
            question_count = sum(len(questions) for questions in QUESTIONS_DATA.get(module["title"], {}).values())
            print(f"  • {module['title']}: {video_count} vídeos, {question_count} questões")
        
    except Exception as e:
        print(f"❌ Erro ao popular banco de dados: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())