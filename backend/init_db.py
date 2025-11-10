#!/usr/bin/env python
"""
Script d'initialisation de la base de données
Crée toutes les tables si elles n'existent pas
"""
import os
import sys
import time
from app import app, db

def init_db():
    """Initialize database with proper error handling"""
    max_retries = 10
    retry_delay = 3
    
    for attempt in range(max_retries):
        try:
            with app.app_context():
                print(f"🔧 Attempt {attempt + 1} to create database tables...")
                # Print database URI for debugging
                print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
                
                # Create all tables (this won't drop existing tables or data)
                db.create_all()
                print("✅ Database tables created successfully!")
                
                # Verify tables exist
                from sqlalchemy import inspect
                inspector = inspect(db.engine)
                tables = inspector.get_table_names()
                print(f"📊 Available tables: {tables}")
                
                return True
        except Exception as e:
            print(f"❌ Error creating database tables (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                import traceback
                traceback.print_exc()
                return False
    
    return False

if __name__ == '__main__':
    # Always initialize the database (SQLAlchemy handles existing tables properly)
    print("🔧 Initializing database...")
    print(f"Database URL: {os.getenv('DATABASE_URL', 'Not set')}")
    
    # Add a small delay to ensure database is ready
    time.sleep(2)
    
    success = init_db()
    if success:
        print("✅ Database initialization completed successfully!")
        sys.exit(0)
    else:
        print("❌ Database initialization failed!")
        sys.exit(1)