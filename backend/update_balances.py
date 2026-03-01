from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

def update_balances():
    db = SessionLocal()
    try:
        accounts = db.query(models.Account).all()
        print(f"Found {len(accounts)} accounts. Updating balances to 50000...")
        for account in accounts:
            account.balance = 50000.0
        
        db.commit()
        print("All account balances updated successfully.")
    except Exception as e:
        print(f"Error updating balances: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_balances()
