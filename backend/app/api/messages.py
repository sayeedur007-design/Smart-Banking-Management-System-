from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class MessageCreate(BaseModel):
    email: EmailStr
    message: str

class MessageResponse(BaseModel):
    id: int
    email: str
    user_name: str
    message: str
    is_read: int
    admin_reply: Optional[str] = None
    replied_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReplyCreate(BaseModel):
    reply: str

@router.post("/messages", response_model=MessageResponse)
async def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    """Create a new message from user to admin"""
    # Verify that the email exists in the database
    user = db.query(models.User).filter(models.User.email == message.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered in our system")
    
    # Create the message
    db_message = models.Message(
        email=message.email,
        user_name=user.name,
        message=message.message
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    return db_message

@router.get("/messages", response_model=List[MessageResponse])
async def get_all_messages(db: Session = Depends(get_db)):
    """Get all messages for admin dashboard"""
    messages = db.query(models.Message).order_by(models.Message.created_at.desc()).all()
    return messages

@router.patch("/messages/{message_id}/read")
async def mark_message_as_read(message_id: int, db: Session = Depends(get_db)):
    """Mark a message as read"""
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = 1
    db.commit()
    
    return {"status": "success", "message": "Message marked as read"}

@router.post("/messages/{message_id}/reply", response_model=MessageResponse)
async def reply_to_message(message_id: int, reply_data: ReplyCreate, db: Session = Depends(get_db)):
    """Reply to a user message"""
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.admin_reply = reply_data.reply
    message.replied_at = datetime.now()
    message.is_read = 1  # Auto-mark as read when replying
    db.commit()
    db.refresh(message)
    
    return message
