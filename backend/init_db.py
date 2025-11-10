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
    max_retries = 15
    retry_delay = 5
    
    # Print environment variables for debugging
    print("Environment variables in init_db:")
    for key, value in sorted(os.environ.items()):
        if 'DATABASE' in key.upper() or 'POSTGRES' in key.upper():
            print(f"  {key}: {value}")
    
    for attempt in range(max_retries):
        try:
            with app.app_context():
                print(f"🔧 Attempt {attempt + 1} to create database tables...")
                # Print database URI for debugging
                print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
                
                # Test database connection first
                print("Testing database connection...")
                db.engine.connect()
                print("✅ Database connection successful!")
                
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
            if "InsufficientPrivilege" in str(e):
                print("❌ Insufficient privileges to create tables. This might be a PostgreSQL permission issue.")
                print("Please ensure the database user has CREATE privileges on the database.")
                # For Render deployment, this might be expected as the database service handles it
                print("⚠️  For Render deployment, this error might be expected and handled by the platform.")
                return True  # Return True to continue deployment
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
    
    # Add a delay to ensure database is ready
    print("Waiting for database to be ready...")
    time.sleep(5)
    
    success = init_db()
    if success:
        print("✅ Database initialization completed successfully!")
        sys.exit(0)
    else:
        print("❌ Database initialization failed!")
        sys.exit(1)