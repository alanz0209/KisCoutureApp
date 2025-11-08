from app import app, db
import os

# Remove existing database
if os.path.exists('kis_couture.db'):
    os.remove('kis_couture.db')
    print("Removed existing database")

with app.app_context():
    print("Manually creating tables...")
    from app import Measurement
    from sqlalchemy.schema import CreateTable
    from sqlalchemy import text
    
    # Get the CREATE TABLE statement
    table = Measurement.__table__
    create_sql = CreateTable(table).compile(db.engine)
    
    # Execute the CREATE TABLE statement directly
    db.session.execute(text(str(create_sql)))
    db.session.commit()
    print("Measurement table created")
    
    # Also create other tables
    from app import Client, Order, User
    for model in [Client, Order, User]:
        table = model.__table__
        create_sql = CreateTable(table).compile(db.engine)
        db.session.execute(text(str(create_sql)))
        db.session.commit()
        print(f"{model.__name__} table created")
    
    # Check the schema
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