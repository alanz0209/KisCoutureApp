from app import app, db
import os

# Remove existing database
if os.path.exists('kis_couture.db'):
    os.remove('kis_couture.db')
    print("Removed existing database")

with app.app_context():
    print("Generating CREATE TABLE SQL...")
    from app import Measurement
    # Get the CREATE TABLE statement as a string
    from sqlalchemy.schema import CreateTable
    table = Measurement.__table__
    create_sql = CreateTable(table).compile(db.engine)
    print("CREATE TABLE SQL:")
    print(str(create_sql))