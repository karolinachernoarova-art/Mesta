import uuid
from pathlib import Path

from flask import Blueprint, current_app, jsonify, send_from_directory, request
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

bp = Blueprint('uploads', __name__, url_prefix='/uploads')

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif'}


def upload_root():
    configured = Path(current_app.config['UPLOAD_FOLDER'])
    if configured.is_absolute():
        return configured
    return Path(current_app.root_path).parent / configured


def is_allowed(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp.post('')
@jwt_required()
def upload_image():
    file = request.files.get('file')
    if not file or not file.filename:
        return jsonify({'error': 'File is required'}), 400
    if not is_allowed(file.filename):
        return jsonify({'error': 'Поддерживаются JPG, PNG, WEBP, GIF, HEIC, HEIF и AVIF'}), 400

    extension = secure_filename(file.filename).rsplit('.', 1)[1].lower()
    filename = f'{uuid.uuid4().hex}.{extension}'
    root = upload_root()
    root.mkdir(parents=True, exist_ok=True)
    file.save(root / filename)
    return jsonify({'url': f'/api/uploads/{filename}'})


@bp.get('/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(upload_root(), filename)
