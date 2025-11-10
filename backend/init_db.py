#!/usr/bin/env python
"""
Script d'initialisation de la base de données
Crée toutes les tables si elles n'existent pas
"""
import os
import sys
from app import app, db

def init_db():
    """Initialize database with proper error handling"""
    try:
        with app.app_context():
            print("🔧 Creating database tables...")
            # Create all tables (this won't drop existing tables or data)
            db.create_all()
            print("✅ Database tables created successfully!")
            
            # Verify tables exist
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"📊 Available tables: {tables}")
            
            # Check if required tables exist
            required_tables = ['client', 'measurement', 'order']
            missing_tables = [table for table in required_tables if table not in tables]
            
            if missing_tables:
                print(f"⚠️  Warning: Missing tables: {missing_tables}")
                # Try to create them again
                db.create_all()
                tables = inspector.get_table_names()
                print(f"🔄 Tables after retry: {tables}")
            
            return True
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    # Check if database already exists and has data
    with app.app_context():
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        
        if tables:
            # Check if any tables have data
            has_data = False
            for table in ['client', 'measurement', 'order']:
                if table in tables:
                    result = db.session.execute(db.text(f"SELECT COUNT(*) FROM {table}")).scalar()
                    if result > 0:
                        has_data = True
                        print(f"📊 Found {result} records in {table} table")
                        break
            
            if has_data:
                print("⚠️  Database already exists with data. Skipping initialization to preserve data.")
                sys.exit(0)
    
    print("🔧 Initializing database...")
    success = init_db()
    if success:
        print("✅ Database initialization completed successfully!")
        sys.exit(0)
    else:
        print("❌ Database initialization failed!")
        sys.exit(1)