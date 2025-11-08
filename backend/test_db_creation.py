from app import app, db
import os

# Remove existing database
if os.path.exists('kis_couture.db'):
    os.remove('kis_couture.db')
    print("Removed existing database")

with app.app_context():
    print("Creating tables using model metadata...")
    # Use the model's metadata to create tables
    from app import Measurement, Client, Order, User
    Measurement.metadata.create_all(db.engine)
    print("Tables created")
    
    # Check if tables were actually created
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Tables in database: {tables}")
    
    if 'measurement' in tables:
        columns = inspector.get_columns('measurement')
        print(f"Columns in measurement table: {len(columns)}")
        for col in columns:
            print(f"  {col['name']} ({col['type']})")
    else:
        print("Measurement table not found")