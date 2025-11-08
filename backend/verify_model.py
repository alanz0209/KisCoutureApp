from app import app, Measurement
import inspect

with app.app_context():
    # Get the actual model definition
    print("Model definition from SQLAlchemy:")
    table = Measurement.__table__
    for column in table.columns:
        print(f"  {column.name}: {column.type} (nullable: {column.nullable})")
    
    # Check if the new columns are in the model
    print(f"\nChecking for new columns:")
    print(f"  longueur_genou in model: {'longueur_genou' in [c.name for c in table.columns]}")
    print(f"  tour_mollet in model: {'tour_mollet' in [c.name for c in table.columns]}")