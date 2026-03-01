"""
Database migration script to add upi_id column to users table
Run this script to update existing database with UPI ID support
"""
import sqlite3
import os

# Database path
db_path = os.path.join(os.path.dirname(__file__), 'banking.db')

def migrate_database():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if upi_id column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'upi_id' not in columns:
            print("Adding upi_id column to users table...")
            
            # Add upi_id column
            cursor.execute("ALTER TABLE users ADD COLUMN upi_id TEXT")
            
            # Update existing users with UPI IDs based on their mobile numbers
            cursor.execute("SELECT id, mobile FROM users")
            users = cursor.fetchall()
            
            upi_ids_used = set()
            for user_id, mobile in users:
                if mobile:
                    base_upi_id = f"DS4_{mobile[:5]}@axl"
                    upi_id = base_upi_id
                    
                    # Handle duplicates by adding user_id suffix
                    if upi_id in upi_ids_used:
                        upi_id = f"DS4_{mobile[:5]}{user_id}@axl"
                    
                    upi_ids_used.add(upi_id)
                    cursor.execute("UPDATE users SET upi_id = ? WHERE id = ?", (upi_id, user_id))
                    print(f"Updated user {user_id} with UPI ID: {upi_id}")
            
            # Create unique index on upi_id
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_upi_id ON users(upi_id)")
            
            conn.commit()
            print("Migration completed successfully!")
        else:
            print("upi_id column already exists. No migration needed.")
            
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
