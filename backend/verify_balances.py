from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

def verify_balances():
    db = SessionLocal()
    try:
        accounts = db.query(models.Account).all()
        all_correct = True
        for account in accounts:
            if account.balance != 50000.0:
                print(f"Account {account.account_number} has incorrect balance: {account.balance}")
                all_correct = False
            else:
                pass # Correct
        
        if all_correct:
            print("VERIFICATION SUCCESS: All accounts have 50000.0 balance.")
        else:
            print("VERIFICATION FAILED: Some accounts have incorrect balances.")

    except Exception as e:
        print(f"Error during verification: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_balances()
