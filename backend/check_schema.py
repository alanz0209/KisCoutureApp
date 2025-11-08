import sqlite3
import os

# Check if database file exists
if not os.path.exists('kis_couture.db'):
    print("Database file does not exist")
else:
    print(f"Database file exists with size: {os.path.getsize('kis_couture.db')} bytes")
    
    conn = sqlite3.connect('kis_couture.db')
    cursor = conn.cursor()
    
    # Check if measurement table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='measurement'")
    table_exists = cursor.fetchone()
    
    if table_exists:
        print("Measurement table exists")
        cursor.execute('PRAGMA table_info(measurement)')
        columns = cursor.fetchall()
        print('Columns in measurement table:')
        for col in columns:
            print(f'  {col[1]} ({col[2]})')
            
        # Check specifically for our new columns
        column_names = [col[1] for col in columns]
        print(f"Has longueur_genou: {'longueur_genou' in column_names}")
        print(f"Has tour_mollet: {'tour_mollet' in column_names}")
    else:
        print("Measurement table does not exist")
        
    conn.close()