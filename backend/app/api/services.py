from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
import random
from datetime import datetime, timedelta

router = APIRouter()

# --- Cards ---
@router.get("/cards", response_model=List[schemas.CardResponse])
def read_cards(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    cards = db.query(models.Card).filter(models.Card.user_id == current_user.id).offset(skip).limit(limit).all()
    return cards

@router.post("/cards", response_model=schemas.CardResponse)
def create_card(
    *,
    db: Session = Depends(deps.get_db),
    card_in: schemas.CardCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    # Generate mock card details
    card_number = f"{random.randint(4000, 4999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}"
    expiry_date = (datetime.now() + timedelta(days=365*3)).strftime("%m/%y")
    cvv = str(random.randint(100, 999))
    
    card = models.Card(
        user_id=current_user.id,
        card_number=card_number,
        card_holder=card_in.card_holder,
        expiry_date=expiry_date,
        cvv=cvv,
        type=card_in.type,
        limit=card_in.limit
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card

# --- Investments ---
@router.get("/investments", response_model=List[schemas.InvestmentResponse])
def read_investments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    investments = db.query(models.Investment).filter(models.Investment.user_id == current_user.id).offset(skip).limit(limit).all()
    return investments

@router.post("/investments", response_model=schemas.InvestmentResponse)
def create_investment(
    *,
    db: Session = Depends(deps.get_db),
    investment_in: schemas.InvestmentCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    investment = models.Investment(
        user_id=current_user.id,
        name=investment_in.name,
        type=investment_in.type,
        amount=investment_in.amount,
        current_value=investment_in.amount, # Initial value same as amount
    )
    db.add(investment)
    db.commit()
    db.refresh(investment)
    return investment

# --- Insurance ---
@router.get("/insurance", response_model=List[schemas.InsuranceResponse])
def read_insurance(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    insurance = db.query(models.Insurance).filter(models.Insurance.user_id == current_user.id).offset(skip).limit(limit).all()
    return insurance

@router.post("/insurance", response_model=schemas.InsuranceResponse)
def create_insurance(
    *,
    db: Session = Depends(deps.get_db),
    insurance_in: schemas.InsuranceCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    policy_number = f"POL-{random.randint(100000, 999999)}"
    
    # Calculate Total Cost
    total_cost = insurance_in.premium * insurance_in.years

    # Check Balance
    account = db.query(models.Account).filter(models.Account.user_id == current_user.id).first()
    if not account:
         raise HTTPException(status_code=404, detail="Account not found")
    
    if account.balance < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    # Deduct Balance
    account.balance -= total_cost
    
    # Record Transaction
    transaction = models.Transaction(
        account_id=account.id,
        amount=-total_cost,
        balance_after=account.balance,
        description=f"Insurance Purchase: {insurance_in.provider} - {insurance_in.type} ({insurance_in.years} Years)",
        type=models.TransactionType.DEBIT,
        status="completed"
    )
    db.add(transaction)

    # Calculate Expiry Date
    # We will ignore insurance_in.expiry_date and calculate it based on years
    expiry_date = (datetime.now() + timedelta(days=365 * insurance_in.years)).strftime("%Y-%m-%d")

    insurance = models.Insurance(
        user_id=current_user.id,
        policy_number=policy_number,
        provider=insurance_in.provider,
        type=insurance_in.type,
        premium=insurance_in.premium,
        coverage=insurance_in.coverage,
        expiry_date=expiry_date
    )
    db.add(insurance)
    db.commit()
    db.refresh(insurance)
    return insurance
