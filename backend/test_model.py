from app import app, db, Measurement

with app.app_context():
    # Print the model definition
    print("Model columns:")
    for column in Measurement.__table__.columns:
        print(f"  {column.name}: {column.type}")