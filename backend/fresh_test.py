#!/usr/bin/env python
"""
Fresh test script to create database with new columns
"""
import os
import sys

# Remove existing database
if os.path.exists('kis_couture.db'):
    os.remove('kis_couture.db')
    print("Removed existing database")

# Import the app and models
from app import app, db, Measurement, Client, Order, User

with app.app_context():
    print("Creating all tables...")
    # Force drop all tables first to ensure clean state
    db.drop_all()
    db.create_all()
    print("Tables created")
    
    # Check schema
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"Tables in database: {tables}")
    
    if 'measurement' in tables:
        columns = inspector.get_columns('measurement')
        print(f"Columns in measurement table: {len(columns)}")
        for col in columns:
            print(f"  {col['name']} ({col['type']})")
        
        # Check specifically for our new columns
        column_names = [col['name'] for col in columns]
        print(f"Has longueur_genou: {'longueur_genou' in column_names}")
        print(f"Has tour_mollet: {'tour_mollet' in column_names}")
    else:
        print("Measurement table not found")