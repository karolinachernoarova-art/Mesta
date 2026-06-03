import os
import uuid
import json

import requests
import urllib3
from requests import HTTPError

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def ask_gigachat(prompt):
    auth_data = os.environ.get('GIGACHAT_AUTH_DATA')
    if not auth_data:
        raise RuntimeError('GIGACHAT_AUTH_DATA is missing')

    auth_response = requests.post(
        'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
        headers={
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'RqUID': str(uuid.uuid4()),
            'Authorization': f'Basic {auth_data}',
        },
        data={'scope': 'GIGACHAT_API_PERS'},
        verify=False,
        timeout=20,
    )
    try:
        auth_response.raise_for_status()
    except HTTPError as error:
        if auth_response.status_code == 401:
            raise RuntimeError('GIGACHAT_AUTH_DATA is invalid or expired') from error
        raise
    access_token = auth_response.json()['access_token']

    chat_response = requests.post(
        'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {access_token}',
        },
        json={
            'model': 'GigaChat',
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': 0.7,
            'max_tokens': 1024,
        },
        verify=False,
        timeout=30,
    )
    chat_response.raise_for_status()
    return chat_response.json()['choices'][0]['message']['content']


def moderate_text(text):
    prompt = f"""
Ты модератор отзывов в сервисе бронирования отелей и ресторанов.
Проверь текст пользователя на мат, оскорбления, угрозы, дискриминацию, сексуальный контент, спам, рекламу, персональные данные и бессмысленный мусор.

Ответь строго JSON без markdown:
{{"allowed": true, "reason": ""}}
или
{{"allowed": false, "reason": "короткая причина на русском"}}

Текст:
{text}
""".strip()
    raw = ask_gigachat(prompt)
    try:
        start = raw.find('{')
        end = raw.rfind('}')
        payload = json.loads(raw[start:end + 1] if start != -1 and end != -1 else raw)
        return {
            'allowed': bool(payload.get('allowed')),
            'reason': payload.get('reason') or 'Текст не прошел модерацию',
        }
    except Exception:
        lowered = raw.lower()
        if 'false' in lowered or 'запрещ' in lowered or 'не прош' in lowered:
            return {'allowed': False, 'reason': 'Текст не прошел модерацию'}
        return {'allowed': True, 'reason': ''}


def analyze_reviews(reviews):
    if not reviews:
        return {
            'summary': 'Отзывов пока недостаточно для анализа.',
            'strengths': [],
            'risks': [],
            'actions': ['Соберите первые отзывы после бронирований.'],
        }

    review_text = '\n'.join(
        f'- Оценка {review.rating}/5: {review.comment}'
        for review in reviews[:20]
    )
    prompt = f"""
Ты аналитик сервиса бронирования ресторанов и отелей.
Проанализируй отзывы заведения и верни строго JSON без markdown:
{{
  "summary": "краткий вывод на русском в 1-2 предложения",
  "strengths": ["3 сильные стороны"],
  "risks": ["1-3 проблемы или риска"],
  "actions": ["3 конкретных действия для владельца"]
}}

Отзывы:
{review_text}
""".strip()

    raw = ask_gigachat(prompt)
    start = raw.find('{')
    end = raw.rfind('}')
    payload = json.loads(raw[start:end + 1] if start != -1 and end != -1 else raw)
    return {
        'summary': payload.get('summary') or 'Отзывы в целом положительные.',
        'strengths': payload.get('strengths') or [],
        'risks': payload.get('risks') or [],
        'actions': payload.get('actions') or [],
    }
