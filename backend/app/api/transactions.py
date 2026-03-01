from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.TransactionResponse])
def read_transactions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    account = db.query(models.Account).filter(models.Account.user_id == current_user.id).first()
    if not account:
        return []
    transactions = db.query(models.Transaction).filter(models.Transaction.account_id == account.id).order_by(models.Transaction.created_at.desc()).offset(skip).limit(limit).all()
    return transactions

@router.post("/transfer", response_model=schemas.UserBalance)
def transfer_money(
    *,
    db: Session = Depends(deps.get_db),
    transfer_in: schemas.TransferCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    from app.core import security
    
    # Verify UPI PIN
    if not security.verify_password(transfer_in.upi_pin, current_user.upi_pin_hash):
        raise HTTPException(status_code=400, detail="Invalid UPI PIN")
    
    sender_account = db.query(models.Account).filter(models.Account.user_id == current_user.id).first()
    if not sender_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if sender_account.balance < transfer_in.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Find recipient by mobile or UPI ID
    recipient_user = db.query(models.User).filter(
        (models.User.mobile == transfer_in.recipient_mobile) | 
        (models.User.upi_id == transfer_in.recipient_mobile)
    ).first()
    
    if not recipient_user:
        raise HTTPException(status_code=404, detail="Recipient not found. Please check the mobile number or UPI ID.")
    
    recipient_account = db.query(models.Account).filter(models.Account.user_id == recipient_user.id).first()
    if not recipient_account:
        raise HTTPException(status_code=404, detail="Recipient account not found")

    if sender_account.id == recipient_account.id:
        raise HTTPException(status_code=400, detail="Cannot transfer to self")

    try:
        # Deduct from sender
        sender_account.balance -= transfer_in.amount
        
        # Credit to recipient
        recipient_account.balance += transfer_in.amount
        
        # Create Sender Transaction (Debit)
        recipient_identifier = recipient_user.upi_id if transfer_in.recipient_mobile == recipient_user.upi_id else transfer_in.recipient_mobile
        sender_transaction = models.Transaction(
            account_id=sender_account.id,
            type=models.TransactionType.DEBIT,
            amount=transfer_in.amount,
            description=f"Transfer to {recipient_user.name} ({recipient_identifier})",
            status="success"
        )
        db.add(sender_transaction)

        # Create Recipient Transaction (Credit)
        sender_identifier = current_user.upi_id if current_user.upi_id else current_user.mobile
        recipient_transaction = models.Transaction(
            account_id=recipient_account.id,
            type=models.TransactionType.CREDIT,
            amount=transfer_in.amount,
            description=f"Received from {current_user.name} ({sender_identifier})",
            status="success"
        )
        db.add(recipient_transaction)

        db.commit()
        db.refresh(sender_account)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transfer failed")
    
    return {"balance": sender_account.balance}

@router.post("/recharge", response_model=schemas.UserBalance)
def recharge_mobile(
    *,
    db: Session = Depends(deps.get_db),
    recharge_in: schemas.RechargeCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    from app.core import security
    
    # Verify UPI PIN
    if not security.verify_password(recharge_in.upi_pin, current_user.upi_pin_hash):
        raise HTTPException(status_code=400, detail="Invalid UPI PIN")
    
    account = db.query(models.Account).filter(models.Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account.balance < recharge_in.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    account.balance -= recharge_in.amount
    
    transaction = models.Transaction(
        account_id=account.id,
        type=models.TransactionType.DEBIT,
        amount=recharge_in.amount,
        description=f"Recharge {recharge_in.operator} - {recharge_in.mobile}",
        status="success"
    )
    db.add(transaction)
    db.commit()
    db.refresh(account)
    
    return {"balance": account.balance}

@router.post("/bill-payment", response_model=schemas.UserBalance)
def pay_bill(
    *,
    db: Session = Depends(deps.get_db),
    bill_in: schemas.BillPaymentCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    from app.core import security
    
    # Verify UPI PIN
    if not security.verify_password(bill_in.upi_pin, current_user.upi_pin_hash):
        raise HTTPException(status_code=400, detail="Invalid UPI PIN")
    
    account = db.query(models.Account).filter(models.Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account.balance < bill_in.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    account.balance -= bill_in.amount
    
    transaction = models.Transaction(
        account_id=account.id,
        type=models.TransactionType.DEBIT,
        amount=bill_in.amount,
        description=f"Bill Pay {bill_in.billType} - {bill_in.consumerNumber}",
        status="success"
    )
    db.add(transaction)
    db.commit()
    db.refresh(account)
    
    return {"balance": account.balance}
