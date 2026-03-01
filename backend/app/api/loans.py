from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Loan
from app.api.deps import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class LoanApplication(BaseModel):
    type: str
    amount: float
    interest_rate: float
    tenure_months: int
    emi: float

class LoanResponse(BaseModel):
    id: int
    type: str
    amount: float
    interest_rate: float
    tenure_months: int
    emi: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class LoanStatusResponse(BaseModel):
    credit_score: int
    is_loan_active: bool

@router.get("/status", response_model=LoanStatusResponse)
def get_loan_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return {
        "credit_score": current_user.credit_score,
        "is_loan_active": bool(current_user.is_loan_active)
    }

@router.post("/apply", response_model=LoanResponse)
def apply_for_loan(loan_data: LoanApplication, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # if not current_user.is_loan_active:
    #     raise HTTPException(status_code=403, detail="Loan facility is not active for your account. Please contact admin.")
    
    new_loan = Loan(
        user_id=current_user.id,
        type=loan_data.type,
        amount=loan_data.amount,
        interest_rate=loan_data.interest_rate,
        tenure_months=loan_data.tenure_months,
        emi=loan_data.emi,
        status="pending"
    )
    
    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)
    return new_loan

@router.get("/my-loans", response_model=List[LoanResponse])
def get_my_loans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Loan).filter(Loan.user_id == current_user.id).order_by(Loan.created_at.desc()).all()
