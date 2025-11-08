#!/usr/bin/env python
"""
Script d'initialisation de la base de données
Crée toutes les tables si elles n'existent pas
"""
import sys
import importlib

# Force reload of the app module to get the latest model definition
if 'app' in sys.modules:
    importlib.reload(sys.modules['app'])

from app import app, db

if __name__ == '__main__':
    with app.app_context():
        print("🔧 Création des tables de la base de données...")
        db.create_all()
        print("✅ Tables créées avec succès !")
        print("📊 Tables disponibles:")
        
        # Vérifier les tables créées
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        for table_name in inspector.get_table_names():
            print(f"  - {table_name}")
            
        # Vérifier les colonnes de la table measurement
        print("\n🔍 Colonnes de la table 'measurement':")
        measurement_columns = inspector.get_columns('measurement')
        for col in measurement_columns:
            print(f"  - {col['name']} ({col['type']})")