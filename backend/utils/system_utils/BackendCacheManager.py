from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cache.db'  # You can replace this with your actual database connection
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Replace with a secure secret key for JWT

db = SQLAlchemy(app)
jwt = JWTManager(app)


class BackendCacheManager(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(255), unique=True, nullable=False)
    data = db.Column(db.PickleType, nullable=False)


@app.route('/update_cache', methods=['POST'])
@jwt_required()
def update_cache():
    data = request.get_json()
    key = data.get('key')
    cache_data = data.get('data')

    if not key or not cache_data:
        return jsonify({'message': 'Invalid request'}), 400

    # Check if the key already exists
    existing_cache = BackendCacheManager.query.filter_by(key=key).first()
    if existing_cache:
        existing_cache.data = cache_data
    else:
        new_cache = BackendCacheManager(key=key, data=cache_data)
        db.session.add(new_cache)

    db.session.commit()
    return jsonify({'message': 'Cache updated successfully'})


@app.route('/get_cache', methods=['GET'])
@jwt_required()
def get_cache():
    key = request.args.get('key')
    if not key:
        return jsonify({'message': 'Invalid request'}), 400

    cache_entry = BackendCacheManager.query.filter_by(key=key).first()
    if cache_entry:
        return jsonify(cache_entry.data)
    else:
        return jsonify({'message': 'Cache not found'}), 404


if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
