from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models import UserRole, TransactionType

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User
class UserBase(BaseModel):
    email: EmailStr
    name: str
    mobile: str

class UserCreate(UserBase):
    password: str
    gender: str
    profile_photo: Optional[str] = None
    adhar_number: str
    dob: str
    upi_pin: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    userType: Optional[str] = "user"
    adminCode: Optional[str] = None

class UserResponse(UserBase):
    id: int
    upi_id: str
    role: str
    gender: Optional[str] = None
    profile_photo: Optional[str] = None
    dob: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserBalance(BaseModel):
    balance: float

# Transaction
class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None

class TransferCreate(TransactionBase):
    recipient_mobile: str # or account number
    note: Optional[str] = None
    upi_pin: str

class RechargeCreate(BaseModel):
    mobile: str
    operator: str
    amount: float
    upi_pin: str

class BillPaymentCreate(BaseModel):
    billType: str
    consumerNumber: str
    amount: float
    upi_pin: str

class TransactionResponse(TransactionBase):
    id: int
    account_id: int
    type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Services Schemas
class CardBase(BaseModel):
    card_holder: str
    type: str
    limit: float

class CardCreate(CardBase):
    pass

class CardResponse(CardBase):
    id: int
    card_number: str
    expiry_date: str
    
    class Config:
        from_attributes = True

class InvestmentBase(BaseModel):
    name: str
    type: str
    amount: float

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentResponse(InvestmentBase):
    id: int
    current_value: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class InsuranceBase(BaseModel):
    provider: str
    type: str
    premium: float
    coverage: float
    expiry_date: str

class InsuranceCreate(InsuranceBase):
    years: int

class InsuranceResponse(InsuranceBase):
    id: int
    policy_number: str
    
    class Config:
        from_attributes = True

class LoanRejection(BaseModel):
    reason: str
