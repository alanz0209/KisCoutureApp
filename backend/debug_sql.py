from app import app, db
import os

# Remove existing database
if os.path.exists('kis_couture.db'):
    os.remove('kis_couture.db')
    print("Removed existing database")

with app.app_context():
    print("Generating SQL for table creation...")
    from app import Measurement
    # Print the CREATE TABLE statement
    print("CREATE TABLE SQL:")
    for statement in Measurement.metadata.tables['measurement'].create(bind=db.engine).compile():
        print(statement)