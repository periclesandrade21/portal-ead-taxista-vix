from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

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

class UserSubscriptionCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    carPlate: Optional[str] = None
    licenseNumber: Optional[str] = None

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
@api_router.post("/subscribe", response_model=UserSubscription)
async def create_subscription(subscription_data: UserSubscriptionCreate):
    """Create a new user subscription"""
    # Check if email already exists
    existing_subscription = await db.subscriptions.find_one({"email": subscription_data.email})
    if existing_subscription:
        raise HTTPException(status_code=400, detail="Email já cadastrado no sistema")
    
    subscription = UserSubscription(**subscription_data.dict())
    prepared_data = prepare_for_mongo(subscription.dict())
    
    await db.subscriptions.insert_one(prepared_data)
    
    # Log the subscription
    logging.info(f"Nova inscrição criada: {subscription.name} - {subscription.email}")
    
    return subscription

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