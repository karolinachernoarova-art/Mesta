from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from ..models import User
from ..security import current_user

bp = Blueprint('auth', __name__, url_prefix='/auth')

ADMIN_EMAILS = {
    'hohlov.andrej2014@gmail.com',
    'kkaaroollinaa@yandex.com',
}


def auth_response(user):
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': user.to_public_dict()})


@bp.post('/register')
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User exists'}), 400

    user = User(email=email, password_hash=generate_password_hash(password))
    if email in ADMIN_EMAILS:
        user.is_admin = True
    db.session.add(user)
    db.session.commit()
    return auth_response(user)


@bp.post('/login')
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return auth_response(user)
    return jsonify({'error': 'Invalid credentials'}), 401


@bp.get('/me')
@jwt_required()
def me():
    user = current_user()
    if not user:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'user': user.to_public_dict()})


@bp.put('/me')
@jwt_required()
def update_me():
    user = current_user()
    if not user:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json(silent=True) or {}
    if 'photoUrl' in data:
        user.photo_url = data['photoUrl']
    db.session.commit()
    return jsonify({'success': True})
