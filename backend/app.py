from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///kis_couture.db')
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

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

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
        bas=data.get('bas') if data.get('bas') else None
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
    
    measurement.do = float(data.get('do', 0)) if data.get('do') else measurement.do
    measurement.poitrine = float(data.get('poitrine', 0)) if data.get('poitrine') else measurement.poitrine
    measurement.taille = float(data.get('taille', 0)) if data.get('taille') else measurement.taille
    measurement.longueur = float(data.get('longueur', 0)) if data.get('longueur') else measurement.longueur
    measurement.manche = float(data.get('manche', 0)) if data.get('manche') else measurement.manche
    measurement.tour_manche = float(data.get('tour_manche', 0)) if data.get('tour_manche') else measurement.tour_manche
    measurement.ceinture = float(data.get('ceinture', 0)) if data.get('ceinture') else measurement.ceinture
    measurement.bassin = float(data.get('bassin', 0)) if data.get('bassin') else measurement.bassin
    measurement.cuisse = float(data.get('cuisse', 0)) if data.get('cuisse') else measurement.cuisse
    measurement.longueur_pantalon = float(data.get('longueur_pantalon', 0)) if data.get('longueur_pantalon') else measurement.longueur_pantalon
    measurement.bas = float(data.get('bas', 0)) if data.get('bas') else measurement.bas
    
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
        measurement.do = float(data.get('do', 0)) if data.get('do') else None
        measurement.poitrine = float(data.get('poitrine', 0)) if data.get('poitrine') else None
        measurement.taille = float(data.get('taille', 0)) if data.get('taille') else None
        measurement.longueur = float(data.get('longueur', 0)) if data.get('longueur') else None
        measurement.manche = float(data.get('manche', 0)) if data.get('manche') else None
        measurement.tour_manche = float(data.get('tour_manche', 0)) if data.get('tour_manche') else None
        measurement.ceinture = float(data.get('ceinture', 0)) if data.get('ceinture') else None
        measurement.bassin = float(data.get('bassin', 0)) if data.get('bassin') else None
        measurement.cuisse = float(data.get('cuisse', 0)) if data.get('cuisse') else None
        measurement.longueur_pantalon = float(data.get('longueur_pantalon', 0)) if data.get('longueur_pantalon') else None
        measurement.bas = float(data.get('bas', 0)) if data.get('bas') else None
    else:
        # Création
        measurement = Measurement(
            client_id=client_id,
            do=float(data.get('do', 0)) if data.get('do') else None,
            poitrine=float(data.get('poitrine', 0)) if data.get('poitrine') else None,
            taille=float(data.get('taille', 0)) if data.get('taille') else None,
            longueur=float(data.get('longueur', 0)) if data.get('longueur') else None,
            manche=float(data.get('manche', 0)) if data.get('manche') else None,
            tour_manche=float(data.get('tour_manche', 0)) if data.get('tour_manche') else None,
            ceinture=float(data.get('ceinture', 0)) if data.get('ceinture') else None,
            bassin=float(data.get('bassin', 0)) if data.get('bassin') else None,
            cuisse=float(data.get('cuisse', 0)) if data.get('cuisse') else None,
            longueur_pantalon=float(data.get('longueur_pantalon', 0)) if data.get('longueur_pantalon') else None,
            bas=float(data.get('bas', 0)) if data.get('bas') else None
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
    
    order = Order(
        client_id=data['client_id'],
        montant_total=montant_total,
        montant_avance=montant_avance,
        montant_restant=montant_restant,
        status='en_cours'
    )
    
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

# Sync endpoint for offline/online synchronization
@app.route('/api/sync', methods=['POST'])
def sync_data():
    data = request.json
    
    # Process offline changes
    if 'clients' in data:
        for client_data in data['clients']:
            if 'id' in client_data and client_data['id']:
                # Update existing
                client = Client.query.get(client_data['id'])
                if client:
                    for key, value in client_data.items():
                        if key != 'id' and hasattr(client, key):
                            setattr(client, key, value)
            else:
                # Create new
                client = Client(**{k: v for k, v in client_data.items() if k != 'id'})
                db.session.add(client)
    
    if 'orders' in data:
        for order_data in data['orders']:
            if 'id' in order_data and order_data['id']:
                order = Order.query.get(order_data['id'])
                if order:
                    for key, value in order_data.items():
                        if key != 'id' and hasattr(order, key):
                            setattr(order, key, value)
            else:
                order = Order(**{k: v for k, v in order_data.items() if k != 'id'})
                db.session.add(order)
    
    db.session.commit()
    
    # Return all current data
    return jsonify({
        'clients': [c.to_dict() for c in Client.query.all()],
        'orders': [o.to_dict() for o in Order.query.all()],
        'measurements': [m.to_dict() for m in Measurement.query.all()]
    })

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
    
    # Supprimer l'ancien utilisateur et créer un nouveau
    User.query.delete()
    
    user = User(username=new_username)
    user.set_password(new_password)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Mot de passe réinitialisé avec succès'
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # Utiliser le port de Render ou 5000 par défaut
    port = int(os.getenv('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
