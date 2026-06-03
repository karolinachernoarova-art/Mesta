import os

from flask import Blueprint, current_app, jsonify, send_from_directory

bp = Blueprint('frontend', __name__)


@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def serve_frontend(path):
    static_folder = current_app.config['STATIC_FOLDER']
    if path and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    if path.startswith('assets/'):
        return jsonify({'error': 'Asset not found'}), 404
    if not os.path.exists(os.path.join(static_folder, 'index.html')):
        return jsonify({'error': 'Frontend is not built. Run npm run build first.'}), 503
    return send_from_directory(static_folder, 'index.html')
