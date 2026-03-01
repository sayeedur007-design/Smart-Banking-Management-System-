import sqlite3

def migrate_db():
    conn = sqlite3.connect('banking.db')
    cursor = conn.cursor()

    try:
        cursor.execute("ALTER TABLE loans ADD COLUMN rejection_reason VARCHAR")
        print("Added rejection_reason column to loans table")
    except sqlite3.OperationalError as e:
        print(f"Error (possibly column exists): {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate_db()
