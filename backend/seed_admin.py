from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
from app.core import security

def create_admin_user():
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin_email = "admin@securebank.com"
        existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        
        if existing_admin:
            print(f"Admin user already exists: {admin_email}")
            # Update password to ensure it matches
            existing_admin.password_hash = security.get_password_hash("admin123")
            existing_admin.is_active = 1
            db.commit()
            print("Admin password updated to 'admin123' and user activated")
            return

        # Create Admin User
        admin_user = models.User(
            email=admin_email,
            password_hash=security.get_password_hash("admin123"),
            name="System Administrator",
            mobile="9999999999",
            role=models.UserRole.ADMIN.value,
            is_active=1
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"Admin user created successfully!")
        print(f"Email: {admin_email}")
        print(f"Password: admin123")
        print(f"Admin Code: secret_admin_code") # Assuming this is needed based on schemas.py

    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
