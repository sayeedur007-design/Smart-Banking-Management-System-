from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/me", response_model=schemas.UserResponse)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    if user_update.name:
        current_user.name = user_update.name
    if user_update.mobile:
        current_user.mobile = user_update.mobile
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/me", response_model=schemas.UserResponse)
def delete_user_me(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    db.delete(current_user)
    db.commit()
    return current_user

@router.get("/balance", response_model=schemas.UserBalance)
def read_balance(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    account = db.query(models.Account).filter(models.Account.user_id == current_user.id).first()
    if not account:
         raise HTTPException(status_code=404, detail="Account not found")
    return {"balance": account.balance}

@router.get("/", response_model=List[schemas.UserResponse])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.post("/{user_id}/block", response_model=schemas.UserResponse)
def block_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = 0
    db.commit()
    db.refresh(user)
    return user

@router.post("/{user_id}/unblock", response_model=schemas.UserResponse)
def unblock_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin),
) -> Any:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = 1
    db.commit()
    db.refresh(user)
    return user
