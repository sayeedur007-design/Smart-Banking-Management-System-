import sqlite3
import sys

def migrate_database():
    """Add new user registration fields to the database"""
    try:
        # Connect to the database
        conn = sqlite3.connect('banking.db')
        cursor = conn.cursor()
        
        print("Starting database migration...")
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add gender column if it doesn't exist
        if 'gender' not in columns:
            print("Adding 'gender' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN gender TEXT")
            print("✓ Added 'gender' column")
        else:
            print("✓ 'gender' column already exists")
        
        # Add profile_photo column if it doesn't exist
        if 'profile_photo' not in columns:
            print("Adding 'profile_photo' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN profile_photo TEXT")
            print("✓ Added 'profile_photo' column")
        else:
            print("✓ 'profile_photo' column already exists")
        
        # Add adhar_number column if it doesn't exist
        if 'adhar_number' not in columns:
            print("Adding 'adhar_number' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN adhar_number TEXT")
            print("✓ Added 'adhar_number' column")
        else:
            print("✓ 'adhar_number' column already exists")
        
        # Add dob column if it doesn't exist
        if 'dob' not in columns:
            print("Adding 'dob' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN dob TEXT")
            print("✓ Added 'dob' column")
        else:
            print("✓ 'dob' column already exists")
        
        # Add upi_pin_hash column if it doesn't exist
        if 'upi_pin_hash' not in columns:
            print("Adding 'upi_pin_hash' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN upi_pin_hash TEXT")
            print("✓ Added 'upi_pin_hash' column")
        else:
            print("✓ 'upi_pin_hash' column already exists")
        
        # Commit the changes
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
        # Display updated schema
        cursor.execute("PRAGMA table_info(users)")
        print("\nUpdated users table schema:")
        for column in cursor.fetchall():
            print(f"  - {column[1]} ({column[2]})")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate_database()
