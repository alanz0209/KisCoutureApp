#!/usr/bin/env python
"""
Script d'initialisation de la base de données
Crée toutes les tables si elles n'existent pas
"""
from app import app, db

with app.app_context():
    db.create_all()
    print("Database tables created successfully!")

if __name__ == '__main__':
    with app.app_context():
        print("🔧 Recréation des tables de la base de données...")
        # Supprimer toutes les tables existantes
        db.drop_all()
        # Créer toutes les tables avec le nouveau schéma
        db.create_all()
        print("✅ Tables recréées avec succès !")
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
            
        # Vérifier les colonnes de la table user
        print("\n🔍 Colonnes de la table 'user':")
        user_columns = inspector.get_columns('user')
        for col in user_columns:
            print(f"  - {col['name']} ({col['type']})")