from flask import Blueprint, jsonify, request

from ..services.gigachat import ask_gigachat

bp = Blueprint('ai', __name__, url_prefix='/ai')


@bp.post('/chat')
def ai_chat():
    data = request.get_json(silent=True) or {}
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    try:
        return jsonify({'result': ask_gigachat(prompt)})
    except Exception as error:
        return jsonify({'error': str(error)}), 500
