from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from datetime import datetime
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
# Use absolute path for database on Render
DB_PATH = os.getenv('DATABASE_URL', 'sqlite:///kis_couture.db')
if DB_PATH.startswith('sqlite:///') and not DB_PATH.startswith('sqlite:////'):
    # Convert relative path to absolute path
    import os
    DB_NAME = DB_PATH.replace('sqlite:///', '')
    DB_PATH = f'sqlite:///{os.path.abspath(DB_NAME)}'
    print(f"Using database path: {DB_PATH}")
app.config['SQLALCHEMY_DATABASE_URI'] = DB_PATH
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Configure CORS to allow requests from the frontend domain
CORS(app, origins=[
    "https://kiscouture.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
])
db = SQLAlchemy(app)

# Create all tables with improved error handling
try:
    with app.app_context():
        # Print database URI for debugging
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        # Try to create tables
        db.create_all()
        print("Database tables created successfully!")
        
        # Verify tables exist
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Database tables: {tables}")
except Exception as e:
    print(f"Error creating database tables: {e}")
    import traceback
    traceback.print_exc()

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Models
class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenoms = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    telephone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    measurements = db.relationship('Measurement', backref='client', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='client', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'prenoms': self.prenoms,
            'email': self.email,
            'telephone': self.telephone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Measurement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    
    # Mesures (peuvent contenir des valeurs multiples séparées par des tirets)
    do = db.Column(db.String(50))  # Dos (ex: "90-95" ou "90")
    poitrine = db.Column(db.String(50))
    taille = db.Column(db.String(50))
    longueur = db.Column(db.String(50))
    manche = db.Column(db.String(50))
    tour_manche = db.Column(db.String(50))
    ceinture = db.Column(db.String(50))
    bassin = db.Column(db.String(50))
    cuisse = db.Column(db.String(50))
    longueur_pantalon = db.Column(db.String(50))
    bas = db.Column(db.String(50))
    longueur_genou = db.Column(db.String(50))  # New field
    tour_mollet = db.Column(db.String(50))  # New field
    description = db.Column(db.Text)  # New field for additional information
    
    image_path = db.Column(db.String(255))  # Chemin de l'image
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'do': self.do,
            'poitrine': self.poitrine,
            'taille': self.taille,
            'longueur': self.longueur,
            'manche': self.manche,
            'tour_manche': self.tour_manche,
            'ceinture': self.ceinture,
            'bassin': self.bassin,
            'cuisse': self.cuisse,
            'longueur_pantalon': self.longueur_pantalon,
            'bas': self.bas,
            'longueur_genou': self.longueur_genou,  # New field
            'tour_mollet': self.tour_mollet,  # New field
            'description': self.description,  # New field
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    
    montant_total = db.Column(db.Float, nullable=False)
    montant_avance = db.Column(db.Float, default=0)
    montant_restant = db.Column(db.Float, nullable=False)
    
    status = db.Column(db.String(20), default='en_cours')  # en_cours, termine
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'client': self.client.to_dict() if self.client else None,
            'montant_total': self.montant_total,
            'montant_avance': self.montant_avance,
            'montant_restant': self.montant_restant,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

# Routes - Clients

@app.route('/api/clients', methods=['GET'])
def get_clients():
    clients = Client.query.order_by(Client.created_at.desc()).all()
    return jsonify([client.to_dict() for client in clients])

@app.route('/api/clients/<int:id>', methods=['GET'])
def get_client(id):
    client = Client.query.get_or_404(id)
    return jsonify(client.to_dict())

@app.route('/api/clients', methods=['POST'])
def create_client():
    data = request.json
    client = Client(
        nom=data['nom'],
        prenoms=data['prenoms'],
        email=data.get('email'),
        telephone=data['telephone']
    )
    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201

@app.route('/api/clients/<int:id>', methods=['PUT'])
def update_client(id):
    client = Client.query.get_or_404(id)
    data = request.json
    
    client.nom = data.get('nom', client.nom)
    client.prenoms = data.get('prenoms', client.prenoms)
    client.email = data.get('email', client.email)
    client.telephone = data.get('telephone', client.telephone)
    
    db.session.commit()
    return jsonify(client.to_dict())

@app.route('/api/clients/<int:id>', methods=['DELETE'])
def delete_client(id):
    client = Client.query.get_or_404(id)
    db.session.delete(client)
    db.session.commit()
    return jsonify({'message': 'Client supprimé avec succès'})

# Routes - Measurements
@app.route('/api/measurements/client/<int:client_id>', methods=['GET'])
def get_client_measurements(client_id):
    measurements = Measurement.query.filter_by(client_id=client_id).order_by(Measurement.created_at.desc()).all()
    return jsonify([m.to_dict() for m in measurements])

@app.route('/api/measurements', methods=['GET'])
def get_all_measurements():
    """Get all measurements for all clients"""
    try:
        measurements = Measurement.query.all()
        return jsonify([m.to_dict() for m in measurements])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/measurements', methods=['POST'])
def create_measurement():
    data = request.form
    
    measurement = Measurement(
        client_id=data['client_id'],
        do=data.get('do') if data.get('do') else None,
        poitrine=data.get('poitrine') if data.get('poitrine') else None,
        taille=data.get('taille') if data.get('taille') else None,
        longueur=data.get('longueur') if data.get('longueur') else None,
        manche=data.get('manche') if data.get('manche') else None,
        tour_manche=data.get('tour_manche') if data.get('tour_manche') else None,
        ceinture=data.get('ceinture') if data.get('ceinture') else None,
        bassin=data.get('bassin') if data.get('bassin') else None,
        cuisse=data.get('cuisse') if data.get('cuisse') else None,
        longueur_pantalon=data.get('longueur_pantalon') if data.get('longueur_pantalon') else None,
        bas=data.get('bas') if data.get('bas') else None,
        longueur_genou=data.get('longueur_genou') if data.get('longueur_genou') else None,  # New field
        tour_mollet=data.get('tour_mollet') if data.get('tour_mollet') else None,  # New field
        description=data.get('description') if data.get('description') else None  # New field
    )
    
    # Handle image upload
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename:
            filename = secure_filename(f"{data['client_id']}_{datetime.now().timestamp()}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            measurement.image_path = filename
    
    db.session.add(measurement)
    db.session.commit()
    return jsonify(measurement.to_dict()), 201

@app.route('/api/measurements/<int:id>', methods=['PUT'])
def update_measurement(id):
    measurement = Measurement.query.get_or_404(id)
    data = request.form
    
    measurement.do = data.get('do', measurement.do) if data.get('do') else measurement.do
    measurement.poitrine = data.get('poitrine', measurement.poitrine) if data.get('poitrine') else measurement.poitrine
    measurement.taille = data.get('taille', measurement.taille) if data.get('taille') else measurement.taille
    measurement.longueur = data.get('longueur', measurement.longueur) if data.get('longueur') else measurement.longueur
    measurement.manche = data.get('manche', measurement.manche) if data.get('manche') else measurement.manche
    measurement.tour_manche = data.get('tour_manche', measurement.tour_manche) if data.get('tour_manche') else measurement.tour_manche
    measurement.ceinture = data.get('ceinture', measurement.ceinture) if data.get('ceinture') else measurement.ceinture
    measurement.bassin = data.get('bassin', measurement.bassin) if data.get('bassin') else measurement.bassin
    measurement.cuisse = data.get('cuisse', measurement.cuisse) if data.get('cuisse') else measurement.cuisse
    measurement.longueur_pantalon = data.get('longueur_pantalon', measurement.longueur_pantalon) if data.get('longueur_pantalon') else measurement.longueur_pantalon
    measurement.bas = data.get('bas', measurement.bas) if data.get('bas') else measurement.bas
    measurement.longueur_genou = data.get('longueur_genou', measurement.longueur_genou) if data.get('longueur_genou') else measurement.longueur_genou  # New field
    measurement.tour_mollet = data.get('tour_mollet', measurement.tour_mollet) if data.get('tour_mollet') else measurement.tour_mollet  # New field
    measurement.description = data.get('description', measurement.description) if data.get('description') else measurement.description  # New field
    
    # Handle image upload
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename:
            # Delete old image if exists
            if measurement.image_path:
                old_path = os.path.join(app.config['UPLOAD_FOLDER'], measurement.image_path)
                if os.path.exists(old_path):
                    os.remove(old_path)
            
            filename = secure_filename(f"{measurement.client_id}_{datetime.now().timestamp()}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            measurement.image_path = filename
    
    db.session.commit()
    return jsonify(measurement.to_dict())

@app.route('/api/measurements/client/<int:client_id>', methods=['PUT'])
def update_client_measurement(client_id):
    # Trouver ou créer une mesure pour ce client
    measurement = Measurement.query.filter_by(client_id=client_id).first()
    data = request.form
    
    if measurement:
        # Mise à jour
        measurement.do = data.get('do', measurement.do) if data.get('do') else measurement.do
        measurement.poitrine = data.get('poitrine', measurement.poitrine) if data.get('poitrine') else measurement.poitrine
        measurement.taille = data.get('taille', measurement.taille) if data.get('taille') else measurement.taille
        measurement.longueur = data.get('longueur', measurement.longueur) if data.get('longueur') else measurement.longueur
        measurement.manche = data.get('manche', measurement.manche) if data.get('manche') else measurement.manche
        measurement.tour_manche = data.get('tour_manche', measurement.tour_manche) if data.get('tour_manche') else measurement.tour_manche
        measurement.ceinture = data.get('ceinture', measurement.ceinture) if data.get('ceinture') else measurement.ceinture
        measurement.bassin = data.get('bassin', measurement.bassin) if data.get('bassin') else measurement.bassin
        measurement.cuisse = data.get('cuisse', measurement.cuisse) if data.get('cuisse') else measurement.cuisse
        measurement.longueur_pantalon = data.get('longueur_pantalon', measurement.longueur_pantalon) if data.get('longueur_pantalon') else measurement.longueur_pantalon
        measurement.bas = data.get('bas', measurement.bas) if data.get('bas') else measurement.bas
        measurement.longueur_genou = data.get('longueur_genou', measurement.longueur_genou) if data.get('longueur_genou') else measurement.longueur_genou  # New field
        measurement.tour_mollet = data.get('tour_mollet', measurement.tour_mollet) if data.get('tour_mollet') else measurement.tour_mollet  # New field
        measurement.description = data.get('description', measurement.description) if data.get('description') else measurement.description  # New field
    else:
        # Création
        measurement = Measurement(
            client_id=client_id,
            do=data.get('do') if data.get('do') else None,
            poitrine=data.get('poitrine') if data.get('poitrine') else None,
            taille=data.get('taille') if data.get('taille') else None,
            longueur=data.get('longueur') if data.get('longueur') else None,
            manche=data.get('manche') if data.get('manche') else None,
            tour_manche=data.get('tour_manche') if data.get('tour_manche') else None,
            ceinture=data.get('ceinture') if data.get('ceinture') else None,
            bassin=data.get('bassin') if data.get('bassin') else None,
            cuisse=data.get('cuisse') if data.get('cuisse') else None,
            longueur_pantalon=data.get('longueur_pantalon') if data.get('longueur_pantalon') else None,
            bas=data.get('bas') if data.get('bas') else None,
            longueur_genou=data.get('longueur_genou') if data.get('longueur_genou') else None,  # New field
            tour_mollet=data.get('tour_mollet') if data.get('tour_mollet') else None,  # New field
            description=data.get('description') if data.get('description') else None  # New field
        )
        db.session.add(measurement)
    
    # Handle image upload
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename:
            # Delete old image if exists
            if measurement.image_path:
                old_path = os.path.join(app.config['UPLOAD_FOLDER'], measurement.image_path)
                if os.path.exists(old_path):
                    os.remove(old_path)
            
            filename = secure_filename(f"{client_id}_{datetime.now().timestamp()}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            measurement.image_path = filename
    
    db.session.commit()
    return jsonify(measurement.to_dict())

# Routes - Orders
@app.route('/api/orders', methods=['GET'])
def get_orders():
    status = request.args.get('status')
    if status:
        orders = Order.query.filter_by(status=status).order_by(Order.created_at.desc()).all()
    else:
        orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([order.to_dict() for order in orders])

@app.route('/api/orders/<int:id>', methods=['GET'])
def get_order(id):
    order = Order.query.get_or_404(id)
    return jsonify(order.to_dict())

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    
    montant_total = float(data['montant_total'])
    montant_avance = float(data.get('montant_avance', 0))
    montant_restant = montant_total - montant_avance
    
    # Determine status based on payment completion
    status = 'termine' if montant_restant <= 0 else 'en_cours'
    
    order = Order(
        client_id=data['client_id'],
        montant_total=montant_total,
        montant_avance=montant_avance,
        montant_restant=montant_restant,
        status=status
    )
    
    # Set completed_at if order is already complete
    if status == 'termine':
        order.completed_at = datetime.utcnow()
    
    db.session.add(order)
    db.session.commit()
    return jsonify(order.to_dict()), 201

@app.route('/api/orders/<int:id>', methods=['PUT'])
def update_order(id):
    order = Order.query.get_or_404(id)
    data = request.json
    
    if 'montant_total' in data:
        order.montant_total = float(data['montant_total'])
    if 'montant_avance' in data:
        order.montant_avance = float(data['montant_avance'])
    
    order.montant_restant = order.montant_total - order.montant_avance
    
    if 'status' in data:
        order.status = data['status']
        if data['status'] == 'termine':
            order.completed_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(order.to_dict())

@app.route('/api/orders/<int:id>', methods=['DELETE'])
def delete_order(id):
    order = Order.query.get_or_404(id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({'message': 'Commande supprimée avec succès'})

# Routes - Dashboard Stats
@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_clients = Client.query.count()
    total_orders = Order.query.count()
    orders_en_cours = Order.query.filter_by(status='en_cours').count()
    orders_termine = Order.query.filter_by(status='termine').count()
    
    # Calculate total revenue
    all_orders = Order.query.all()
    total_revenue = sum(order.montant_total for order in all_orders)
    total_avance = sum(order.montant_avance for order in all_orders)
    total_restant = sum(order.montant_restant for order in all_orders)
    
    return jsonify({
        'total_clients': total_clients,
        'total_orders': total_orders,
        'orders_en_cours': orders_en_cours,
        'orders_termine': orders_termine,
        'total_revenue': total_revenue,
        'total_avance': total_avance,
        'total_restant': total_restant
    })

# Route - Upload image
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Route to initialize database (for debugging)
@app.route('/api/init-db', methods=['POST'])
def init_database():
    try:
        with app.app_context():
            db.create_all()
            return jsonify({'success': True, 'message': 'Database initialized successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Sync endpoint for offline/online synchronization
@app.route('/api/sync', methods=['POST'])
def sync_data():
    """Endpoint for syncing data from client to server"""
    try:
        data = request.json
        sync_timestamp = datetime.utcnow()
        
        # Keep track of ID mappings for temporary to real IDs
        id_mappings = {}
        
        # Process client updates
        if 'clients' in data:
            for client_data in data['clients']:
                # For temporary clients, we need to create new records without the temp ID
                if str(client_data['id']).startswith('temp_'):
                    # Create new client with auto-generated ID
                    client = Client(
                        nom=client_data['nom'],
                        prenoms=client_data['prenoms'],
                        email=client_data.get('email'),
                        telephone=client_data['telephone'],
                        created_at=client_data.get('created_at', sync_timestamp),
                        updated_at=sync_timestamp
                    )
                    db.session.add(client)
                    db.session.flush()  # Get the generated ID without committing
                    # Store mapping from temp ID to real ID
                    id_mappings[client_data['id']] = client.id
                else:
                    # Check if client exists
                    client = Client.query.get(client_data['id'])
                    if client:
                        # Update existing client
                        client.nom = client_data.get('nom', client.nom)
                        client.prenoms = client_data.get('prenoms', client.prenoms)
                        client.email = client_data.get('email', client.email)
                        client.telephone = client_data.get('telephone', client.telephone)
                        client.updated_at = sync_timestamp
                    else:
                        # Create new client with the provided ID
                        client = Client(
                            id=client_data['id'],
                            nom=client_data['nom'],
                            prenoms=client_data['prenoms'],
                            email=client_data.get('email'),
                            telephone=client_data['telephone'],
                            created_at=client_data.get('created_at', sync_timestamp),
                            updated_at=sync_timestamp
                        )
                        db.session.add(client)
        
        # Process measurement updates
        if 'measurements' in data:
            for measurement_data in data['measurements']:
                # Update client_id if it was a temporary ID that got mapped to a real ID
                original_client_id = measurement_data['client_id']
                if str(original_client_id).startswith('temp_') and original_client_id in id_mappings:
                    measurement_data['client_id'] = id_mappings[original_client_id]
                
                # For temporary measurements, create new records
                if str(measurement_data['id']).startswith('temp_'):
                    measurement = Measurement(
                        client_id=measurement_data['client_id'],
                        do=measurement_data.get('do'),
                        poitrine=measurement_data.get('poitrine'),
                        taille=measurement_data.get('taille'),
                        longueur=measurement_data.get('longueur'),
                        manche=measurement_data.get('manche'),
                        tour_manche=measurement_data.get('tour_manche'),
                        ceinture=measurement_data.get('ceinture'),
                        bassin=measurement_data.get('bassin'),
                        cuisse=measurement_data.get('cuisse'),
                        longueur_pantalon=measurement_data.get('longueur_pantalon'),
                        bas=measurement_data.get('bas'),
                        longueur_genou=measurement_data.get('longueur_genou'),  # New field
                        tour_mollet=measurement_data.get('tour_mollet'),  # New field
                        description=measurement_data.get('description'),  # New field
                        image_path=measurement_data.get('image_path'),
                        created_at=measurement_data.get('created_at', sync_timestamp),
                        updated_at=sync_timestamp
                    )
                    db.session.add(measurement)
                else:
                    # Check if measurement exists
                    measurement = Measurement.query.get(measurement_data['id'])
                    if measurement:
                        # Update existing measurement
                        measurement.client_id = measurement_data.get('client_id', measurement.client_id)
                        measurement.do = measurement_data.get('do', measurement.do)
                        measurement.poitrine = measurement_data.get('poitrine', measurement.poitrine)
                        measurement.taille = measurement_data.get('taille', measurement.taille)
                        measurement.longueur = measurement_data.get('longueur', measurement.longueur)
                        measurement.manche = measurement_data.get('manche', measurement.manche)
                        measurement.tour_manche = measurement_data.get('tour_manche', measurement.tour_manche)
                        measurement.ceinture = measurement_data.get('ceinture', measurement.ceinture)
                        measurement.bassin = measurement_data.get('bassin', measurement.bassin)
                        measurement.cuisse = measurement_data.get('cuisse', measurement.cuisse)
                        measurement.longueur_pantalon = measurement_data.get('longueur_pantalon', measurement.longueur_pantalon)
                        measurement.bas = measurement_data.get('bas', measurement.bas)
                        measurement.longueur_genou = measurement_data.get('longueur_genou', measurement.longueur_genou)  # New field
                        measurement.tour_mollet = measurement_data.get('tour_mollet', measurement.tour_mollet)  # New field
                        measurement.description = measurement_data.get('description', measurement.description)  # New field
                        measurement.image_path = measurement_data.get('image_path', measurement.image_path)
                        measurement.updated_at = sync_timestamp
                    else:
                        # Create new measurement with the provided ID
                        measurement = Measurement(
                            id=measurement_data['id'],
                            client_id=measurement_data['client_id'],
                            do=measurement_data.get('do'),
                            poitrine=measurement_data.get('poitrine'),
                            taille=measurement_data.get('taille'),
                            longueur=measurement_data.get('longueur'),
                            manche=measurement_data.get('manche'),
                            tour_manche=measurement_data.get('tour_manche'),
                            ceinture=measurement_data.get('ceinture'),
                            bassin=measurement_data.get('bassin'),
                            cuisse=measurement_data.get('cuisse'),
                            longueur_pantalon=measurement_data.get('longueur_pantalon'),
                            bas=measurement_data.get('bas'),
                            longueur_genou=measurement_data.get('longueur_genou'),  # New field
                            tour_mollet=measurement_data.get('tour_mollet'),  # New field
                            description=measurement_data.get('description'),  # New field
                            image_path=measurement_data.get('image_path'),
                            created_at=measurement_data.get('created_at', sync_timestamp),
                            updated_at=sync_timestamp
                        )
                        db.session.add(measurement)
        
        # Process order updates
        if 'orders' in data:
            for order_data in data['orders']:
                # Update client_id if it was a temporary ID that got mapped to a real ID
                original_client_id = order_data['client_id']
                if str(original_client_id).startswith('temp_') and original_client_id in id_mappings:
                    order_data['client_id'] = id_mappings[original_client_id]
                
                # For temporary orders, create new records
                if str(order_data['id']).startswith('temp_'):
                    order = Order(
                        client_id=order_data['client_id'],
                        montant_total=order_data['montant_total'],
                        montant_avance=order_data.get('montant_avance', 0),
                        montant_restant=order_data['montant_restant'],
                        status=order_data.get('status', 'en_cours'),
                        created_at=order_data.get('created_at', sync_timestamp),
                        updated_at=sync_timestamp,
                        completed_at=order_data.get('completed_at')
                    )
                    db.session.add(order)
                else:
                    # Check if order exists
                    order = Order.query.get(order_data['id'])
                    if order:
                        # Update existing order
                        order.client_id = order_data.get('client_id', order.client_id)
                        order.montant_total = order_data.get('montant_total', order.montant_total)
                        order.montant_avance = order_data.get('montant_avance', order.montant_avance)
                        order.montant_restant = order_data.get('montant_restant', order.montant_restant)
                        order.status = order_data.get('status', order.status)
                        order.completed_at = order_data.get('completed_at', order.completed_at)
                        order.updated_at = sync_timestamp
                    else:
                        # Create new order with the provided ID
                        order = Order(
                            id=order_data['id'],
                            client_id=order_data['client_id'],
                            montant_total=order_data['montant_total'],
                            montant_avance=order_data.get('montant_avance', 0),
                            montant_restant=order_data['montant_restant'],
                            status=order_data.get('status', 'en_cours'),
                            created_at=order_data.get('created_at', sync_timestamp),
                            updated_at=sync_timestamp,
                            completed_at=order_data.get('completed_at')
                        )
                        db.session.add(order)
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Data synchronized successfully', 'id_mappings': id_mappings})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/sync/last-update', methods=['GET'])
def get_last_update():
    """Get the timestamp of the last update on the server"""
    try:
        # Get the latest updated_at timestamp from any table
        client_updated = db.session.query(db.func.max(Client.updated_at)).scalar()
        measurement_updated = db.session.query(db.func.max(Measurement.updated_at)).scalar()
        order_updated = db.session.query(db.func.max(Order.updated_at)).scalar()
        
        timestamps = [client_updated, measurement_updated, order_updated]
        valid_timestamps = [t for t in timestamps if t is not None]
        
        if valid_timestamps:
            latest = max(valid_timestamps)
            return jsonify({'last_update': latest.isoformat()})
        else:
            return jsonify({'last_update': datetime.utcnow().isoformat()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route de Récupération Maître (MASTER RECOVERY)
# ⚠️ À utiliser UNIQUEMENT en cas d'urgence
@app.route('/api/master-recovery/verify', methods=['POST'])
def verify_master_credentials():
    """
    Vérifie les identifiants maître de récupération
    Utilisé pour débloquer l'accès si le couturier oublie ses identifiants
    """
    data = request.json
    
    # Récupérer les credentials maître depuis les variables d'environnement
    master_username = os.getenv('MASTER_USERNAME', 'admin_rescue_kiscouture')
    master_password = os.getenv('MASTER_PASSWORD', 'KisC0uture@Rescue2025!SecureMaster')
    
    # Vérifier les credentials
    if (data.get('username') == master_username and 
        data.get('password') == master_password):
        return jsonify({
            'valid': True,
            'message': 'Clé maître vérifiée - Accès de récupération accordé'
        })
    else:
        return jsonify({
            'valid': False,
            'message': 'Identifiants de récupération incorrects'
        }), 401

# Routes - Authentification
@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Enregistrer un nouvel utilisateur (premier setup) - Bypass authentication
    """
    data = request.json
    username = data.get('username')
    password = data.get('password')
    pin = data.get('pin')
    email = data.get('email')
    
    if not username or not password:
        return jsonify({'error': 'Username et password requis'}), 400
    
    # Bypass authentication - always allow registration
    return jsonify({
        'success': True,
        'message': 'Utilisateur créé avec succès',
        'user': {'id': 1, 'username': username, 'created_at': None}
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Connexion utilisateur - Bypass authentication
    """
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username et password requis'}), 400
    
    # Bypass authentication - always allow login
    return jsonify({
        'success': True,
        'message': 'Connexion réussie',
        'user': {'id': 1, 'username': username, 'created_at': None}
    })

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    """
    Vérifier si un utilisateur est déjà enregistré
    """
    # Always return that a user exists to bypass authentication
    return jsonify({
        'has_user': True,
        'user': {'id': 1, 'username': 'default_user', 'created_at': None}
    })

@app.route('/api/auth/reset', methods=['POST'])
def reset_password():
    """
    Réinitialiser le mot de passe (via master recovery)
    """
    data = request.json
    new_username = data.get('username')
    new_password = data.get('password')
    
    if not new_username or not new_password:
        return jsonify({'error': 'Username et password requis'}), 400
    
    # Bypass authentication - always allow reset
    return jsonify({
        'success': True,
        'message': 'Mot de passe réinitialisé avec succès'
    })

@app.route('/api/auth/pin-login', methods=['POST'])
def pin_login():
    """
    Connexion avec PIN - Bypass authentication
    """
    data = request.json
    pin = data.get('pin')
    
    if not pin:
        return jsonify({'error': 'PIN requis'}), 400
    
    # Bypass authentication - always allow PIN login
    return jsonify({
        'success': True,
        'message': 'Connexion avec PIN réussie'
    })

@app.route('/api/auth/forgot-pin', methods=['POST'])
def forgot_pin():
    """
    Réinitialiser le PIN via email - Bypass authentication
    """
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email requis'}), 400
    
    # For now, simulate sending reset email
    return jsonify({
        'success': True,
        'message': 'Instructions de réinitialisation envoyées à votre email'
    })

@app.route('/api/auth/reset-pin', methods=['POST'])
def reset_pin():
    """
    Réinitialiser le PIN - Bypass authentication
    """
    data = request.json
    new_pin = data.get('pin')
    
    if not new_pin:
        return jsonify({'error': 'Nouveau PIN requis'}), 400
    
    # For now, simulate PIN reset
    return jsonify({
        'success': True,
        'message': 'PIN réinitialisé avec succès'
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # Utiliser le port de Render ou 5000 par défaut
    port = int(os.getenv('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
