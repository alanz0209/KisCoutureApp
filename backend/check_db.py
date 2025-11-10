#!/usr/bin/env python
"""
Script to check database connectivity
"""
import os
from dotenv import load_dotenv
from app import app, db

# Load environment variables
load_dotenv()

def check_database():
    """Check database connectivity"""
    try:
        with app.app_context():
            # Test database connection
            db.engine.connect()
            print("✅ Database connection successful!")
            
            # Check if tables exist
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"📊 Database tables: {tables}")
            
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == '__main__':
    print("🔧 Checking database connectivity...")
    success = check_database()
    if success:
        print("✅ Database check completed successfully!")
        exit(0)
    else:
        print("❌ Database check failed!")
        exit(1)