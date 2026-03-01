from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models

def inspect_loans():
    # Ensure tables exist (just in case)
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Checking for loans...")
        loans = db.query(models.Loan).all()
        print(f"Total Loans found: {len(loans)}")
        
        orphaned_loans = []
        for loan in loans:
            user = db.query(models.User).filter(models.User.id == loan.user_id).first()
            if not user:
                print(f"WARNING: Loan ID {loan.id} (Amount: {loan.amount}) has orphaned user_id {loan.user_id}. User does not exist.")
                orphaned_loans.append(loan)
            else:
                print(f"Loan ID {loan.id} belongs to User: {user.name} ({user.email}) - Status: {loan.status}")
                
        if orphaned_loans:
            print(f"\nFound {len(orphaned_loans)} orphaned loans. Deleting them to fix Admin Dashboard...")
            for loan in orphaned_loans:
                db.delete(loan)
            db.commit()
            print("Successfully deleted orphaned loans.")
        else:
            print("\nNo orphaned loans found. Database integrity looks good.")
            
    except Exception as e:
        print(f"Error Inspecting DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_loans()
