"""
Script to remove all user accounts from the database
This will delete all users except admin accounts
"""
import sqlite3
import os

# Database path
db_path = os.path.join(os.path.dirname(__file__), 'banking.db')

def clear_users():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Get count before deletion
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'user'")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        admin_count = cursor.fetchone()[0]
        
        print(f"Found {user_count} user accounts and {admin_count} admin accounts")
        
        if user_count == 0:
            print("No user accounts to delete.")
            conn.close()
            return
        
        # Get user IDs to delete their related data
        cursor.execute("SELECT id FROM users WHERE role = 'user'")
        user_ids = [row[0] for row in cursor.fetchall()]
        
        # Delete related data first (foreign key constraints)
        for user_id in user_ids:
            # Delete transactions for user's accounts
            cursor.execute("""
                DELETE FROM transactions 
                WHERE account_id IN (SELECT id FROM accounts WHERE user_id = ?)
            """, (user_id,))
            
            # Delete accounts
            cursor.execute("DELETE FROM accounts WHERE user_id = ?", (user_id,))
            
            # Delete cards
            cursor.execute("DELETE FROM cards WHERE user_id = ?", (user_id,))
            
            # Delete investments
            cursor.execute("DELETE FROM investments WHERE user_id = ?", (user_id,))
            
            # Delete insurance
            cursor.execute("DELETE FROM insurance WHERE user_id = ?", (user_id,))
            
            # Delete audit logs
            cursor.execute("DELETE FROM audit_logs WHERE user_id = ?", (user_id,))
        
        # Finally delete users
        cursor.execute("DELETE FROM users WHERE role = 'user'")
        
        conn.commit()
        print(f"Successfully deleted {user_count} user accounts and all related data")
        print(f"Admin accounts ({admin_count}) were preserved")
        
    except Exception as e:
        print(f"Error during deletion: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("WARNING: This will delete all user accounts (non-admin) from the database!")
    print("Starting deletion...")
    clear_users()
    print("Done!")
