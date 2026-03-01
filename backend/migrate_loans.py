import sqlite3

def migrate_db():
    conn = sqlite3.connect('banking.db')
    cursor = conn.cursor()

    # Add columns to users table
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN credit_score INTEGER DEFAULT 750")
        print("Added credit_score column to users table")
    except sqlite3.OperationalError:
        print("credit_score column already exists")

    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_loan_active INTEGER DEFAULT 0")
        print("Added is_loan_active column to users table")
    except sqlite3.OperationalError:
        print("is_loan_active column already exists")

    # Create loans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type VARCHAR,
        amount FLOAT,
        interest_rate FLOAT,
        tenure_months INTEGER,
        emi FLOAT,
        status VARCHAR DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)
    print("Created loans table")

    # Set is_loan_active to 1 for all existing users for testing purposes
    cursor.execute("UPDATE users SET is_loan_active = 1")
    print("Enabled loan feature for all existing users")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate_db()
