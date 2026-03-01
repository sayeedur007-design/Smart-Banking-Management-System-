from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class TransactionType(str, enum.Enum):
    CREDIT = "credit"
    DEBIT = "debit"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    mobile = Column(String, unique=True, index=True)
    upi_id = Column(String, unique=True, index=True)
    role = Column(String, default=UserRole.USER)
    is_active = Column(Integer, default=1) # 1 for active, 0 for blocked
    credit_score = Column(Integer, default=750)
    is_loan_active = Column(Integer, default=0) # 0 for disabled, 1 for enabled
    
    # New Fields
    gender = Column(String)
    profile_photo = Column(String, nullable=True)
    adhar_number = Column(String)
    dob = Column(String)
    upi_pin_hash = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    accounts = relationship("Account", back_populates="owner")
    audit_logs = relationship("AuditLog", back_populates="user")
    cards = relationship("Card", back_populates="owner")
    investments = relationship("Investment", back_populates="owner")
    insurance = relationship("Insurance", back_populates="owner")
    loans = relationship("Loan", back_populates="owner")

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_number = Column(String, unique=True, index=True)
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    type = Column(String) # credit or debit
    amount = Column(Float)
    description = Column(String)
    status = Column(String, default="success")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    account = relationship("Account", back_populates="transactions")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    details = Column(String)
    ip_address = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    card_number = Column(String, unique=True, index=True)
    card_holder = Column(String)
    expiry_date = Column(String)
    cvv = Column(String)
    type = Column(String) # Debit/Credit
    limit = Column(Float)
    
    owner = relationship("User", back_populates="cards")

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    type = Column(String) # Mutual Fund, Stock, FD
    amount = Column(Float)
    current_value = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="investments")

class Insurance(Base):
    __tablename__ = "insurance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    policy_number = Column(String, unique=True)
    provider = Column(String)
    type = Column(String) # Health, Life, Vehicle
    premium = Column(Float)
    coverage = Column(Float)
    expiry_date = Column(String)

    owner = relationship("User", back_populates="insurance")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    user_name = Column(String)
    message = Column(String)
    is_read = Column(Integer, default=0)  # 0 for unread, 1 for read
    admin_reply = Column(String, nullable=True)  # Admin's reply
    replied_at = Column(DateTime(timezone=True), nullable=True)  # When admin replied
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    unread_count = Column(Integer, default=0)  # Unread messages for admin

    user = relationship("User", backref="chat_conversation")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("chat_conversations.id"))
    sender_type = Column(String)  # 'user' or 'admin'
    message_text = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Integer, default=0)  # 0 for unread, 1 for read

    conversation = relationship("ChatConversation", back_populates="messages")

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String) # Personal, Home, Car, Education
    amount = Column(Float)
    interest_rate = Column(Float)
    tenure_months = Column(Integer)
    emi = Column(Float)
    status = Column(String, default="pending") # pending, approved, rejected
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="loans")
