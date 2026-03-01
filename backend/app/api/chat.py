from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.api.deps import get_current_user

router = APIRouter()

# Pydantic Models
class ChatMessageCreate(BaseModel):
    message_text: str

class ChatMessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_type: str
    message_text: str
    created_at: datetime
    is_read: int

    class Config:
        from_attributes = True

class ChatConversationResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    created_at: datetime
    updated_at: datetime
    unread_count: int
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConversationWithMessages(BaseModel):
    conversation: ChatConversationResponse
    messages: List[ChatMessageResponse]

    class Config:
        from_attributes = True


# User Endpoints
@router.get("/chat/user/conversation", response_model=ConversationWithMessages)
async def get_user_conversation(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get or create the current user's conversation with admin"""
    # Get or create conversation
    conversation = db.query(models.ChatConversation).filter(
        models.ChatConversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        conversation = models.ChatConversation(user_id=current_user.id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    
    # Get all messages
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.conversation_id == conversation.id
    ).order_by(models.ChatMessage.created_at).all()
    
    # Mark admin messages as read
    for msg in messages:
        if msg.sender_type == "admin" and msg.is_read == 0:
            msg.is_read = 1
    db.commit()
    
    # Prepare response
    conv_response = ChatConversationResponse(
        id=conversation.id,
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        unread_count=conversation.unread_count,
        last_message=messages[-1].message_text if messages else None,
        last_message_time=messages[-1].created_at if messages else None
    )
    
    return ConversationWithMessages(
        conversation=conv_response,
        messages=messages
    )


@router.post("/chat/user/message", response_model=ChatMessageResponse)
async def send_user_message(
    message: ChatMessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message from user to admin"""
    # Get or create conversation
    conversation = db.query(models.ChatConversation).filter(
        models.ChatConversation.user_id == current_user.id
    ).first()
    
    if not conversation:
        conversation = models.ChatConversation(user_id=current_user.id)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    
    # Create message
    chat_message = models.ChatMessage(
        conversation_id=conversation.id,
        sender_type="user",
        message_text=message.message_text
    )
    
    db.add(chat_message)
    
    # Update conversation
    conversation.updated_at = datetime.now()
    conversation.unread_count += 1
    
    db.commit()
    db.refresh(chat_message)
    
    return chat_message


# Admin Endpoints
@router.get("/chat/admin/conversations", response_model=List[ChatConversationResponse])
async def get_all_conversations(db: Session = Depends(get_db)):
    """Get all chat conversations for admin dashboard"""
    conversations = db.query(models.ChatConversation).order_by(
        models.ChatConversation.updated_at.desc()
    ).all()
    
    result = []
    for conv in conversations:
        user = db.query(models.User).filter(models.User.id == conv.user_id).first()
        last_message = db.query(models.ChatMessage).filter(
            models.ChatMessage.conversation_id == conv.id
        ).order_by(models.ChatMessage.created_at.desc()).first()
        
        result.append(ChatConversationResponse(
            id=conv.id,
            user_id=conv.user_id,
            user_name=user.name if user else "Unknown",
            user_email=user.email if user else "Unknown",
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            unread_count=conv.unread_count,
            last_message=last_message.message_text if last_message else None,
            last_message_time=last_message.created_at if last_message else None
        ))
    
    return result


@router.get("/chat/admin/conversations/{conversation_id}/messages", response_model=List[ChatMessageResponse])
async def get_conversation_messages(conversation_id: int, db: Session = Depends(get_db)):
    """Get all messages in a specific conversation"""
    conversation = db.query(models.ChatConversation).filter(
        models.ChatConversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.conversation_id == conversation_id
    ).order_by(models.ChatMessage.created_at).all()
    
    return messages


@router.post("/chat/admin/message", response_model=ChatMessageResponse)
async def send_admin_message(
    conversation_id: int,
    message: ChatMessageCreate,
    db: Session = Depends(get_db)
):
    """Send a message from admin to user"""
    conversation = db.query(models.ChatConversation).filter(
        models.ChatConversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Create message
    chat_message = models.ChatMessage(
        conversation_id=conversation_id,
        sender_type="admin",
        message_text=message.message_text
    )
    
    db.add(chat_message)
    
    # Update conversation
    conversation.updated_at = datetime.now()
    conversation.unread_count = 0  # Reset unread count when admin replies
    
    db.commit()
    db.refresh(chat_message)
    
    return chat_message


@router.patch("/chat/admin/conversations/{conversation_id}/mark-read")
async def mark_conversation_read(conversation_id: int, db: Session = Depends(get_db)):
    """Mark all messages in a conversation as read"""
    conversation = db.query(models.ChatConversation).filter(
        models.ChatConversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Mark all user messages as read
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.conversation_id == conversation_id,
        models.ChatMessage.sender_type == "user",
        models.ChatMessage.is_read == 0
    ).all()
    
    for msg in messages:
        msg.is_read = 1
    
    conversation.unread_count = 0
    db.commit()
    
    return {"status": "success", "message": "All messages marked as read"}
