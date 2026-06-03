from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity

from .models import User


def current_user_id():
    return int(get_jwt_identity())


def current_user():
    return User.query.get(current_user_id())


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = current_user()
        if not user or not user.is_admin:
            return jsonify({'error': 'Unauthorized'}), 403
        return fn(*args, **kwargs)

    return wrapper
