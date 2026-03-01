from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
import random

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(
    db: Session = Depends(deps.get_db),
    form_data: schemas.UserLogin = None
) -> Any:
    # Check if input is email or mobile number
    # Try to find user by email first, then by mobile if not found
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    
    # If not found by email, try mobile number
    if not user:
        user = db.query(models.User).filter(models.User.mobile == form_data.email).first()
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account blocked by bank")
    
    if form_data.userType == "admin" and user.role != models.UserRole.ADMIN:
         raise HTTPException(status_code=400, detail="Not an admin")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=schemas.UserResponse)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
) -> Any:
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    
    # Generate UPI ID: DS4_[first5digits]@axl
    upi_id = f"SN5_{user_in.mobile[:5]}@axl"
    
    # Create User
    user = models.User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        name=user_in.name,
        mobile=user_in.mobile,
        upi_id=upi_id,
        role=models.UserRole.USER.value,
        gender=user_in.gender,
        profile_photo=user_in.profile_photo,
        adhar_number=user_in.adhar_number,
        dob=user_in.dob,
        upi_pin_hash=security.get_password_hash(user_in.upi_pin)
    )
    db.add(user)
    db.flush() # Flush to get user.id but don't commit yet

    # Create Account
    account_number = str(random.randint(1000000000, 9999999999))
    account = models.Account(
        user_id=user.id,
        account_number=account_number,
        balance=50000.0 # Welcome bonus
    )
    db.add(account)
    
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Registration failed")

    return user
