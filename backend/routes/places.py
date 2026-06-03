import uuid

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import Booking, Place, Review, Room, TableObj, User
from ..security import admin_required, current_user, current_user_id
from ..services.gigachat import analyze_reviews
from ..services.gigachat import moderate_text

bp = Blueprint('places', __name__, url_prefix='/places')
reviews_bp = Blueprint('reviews', __name__, url_prefix='/reviews')


def review_summary(reviews):
    if not reviews:
        return {
            'averageRating': 0,
            'totalReviews': 0,
            'positive': 0,
            'neutral': 0,
            'negative': 0,
            'highlights': [],
        }

    positive = len([review for review in reviews if review.rating >= 5])
    neutral = len([review for review in reviews if review.rating == 4])
    negative = len([review for review in reviews if review.rating <= 3])
    highlights = []
    comments = ' '.join((review.comment or '').lower() for review in reviews)
    for keyword in ['сервис', 'чисто', 'атмосфера', 'завтрак', 'расположение', 'бронь', 'кухня', 'персонал']:
        if keyword in comments:
            highlights.append(keyword)

    return {
        'averageRating': round(sum(review.rating for review in reviews) / len(reviews), 1),
        'totalReviews': len(reviews),
        'positive': positive,
        'neutral': neutral,
        'negative': negative,
        'highlights': highlights[:5],
    }


def fallback_ai_review_analysis(reviews):
    summary = review_summary(reviews)
    strengths = []
    risks = []
    actions = []

    comments = ' '.join((review.comment or '').lower() for review in reviews)
    if 'персонал' in comments or 'сервис' in comments:
        strengths.append('Гости часто отмечают качество сервиса и работу персонала.')
    if 'чист' in comments:
        strengths.append('Чистота воспринимается как заметное преимущество.')
    if 'атмосфера' in comments or 'интерьер' in comments:
        strengths.append('Атмосфера и интерьер помогают формировать положительное впечатление.')
    if summary['negative'] > 0:
        risks.append('Есть отзывы с низкой оценкой, их стоит разобрать отдельно.')
    if 'шум' in comments:
        risks.append('Часть гостей обращает внимание на шум в зале или загруженность.')
    if 'цена' in comments:
        risks.append('Цена заметна в восприятии гостей, важно поддерживать соответствие уровню сервиса.')

    actions.append('Отвечать на свежие отзывы в течение суток и благодарить за конкретные детали.')
    actions.append('Выделить в карточке сильные стороны, которые чаще всего повторяются в отзывах.')
    actions.append('Разобрать нейтральные и низкие оценки с персоналом, чтобы убрать повторяющиеся причины.')

    return {
        'summary': f"Средняя оценка {summary['averageRating']} на основе {summary['totalReviews']} отзывов. В целом динамика отзывов положительная." if reviews else 'Отзывов пока недостаточно для анализа.',
        'strengths': strengths[:3] or ['Гости оставляют достаточно высокие оценки.'],
        'risks': risks[:3],
        'actions': actions,
        'source': 'fallback',
    }


@bp.get('')
def get_places():
    return jsonify([place.to_dict() for place in Place.query.all()])


@bp.get('/<place_id>')
def get_place(place_id):
    place = Place.query.get(place_id)
    if not place:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(place.to_dict())


@bp.get('/<place_id>/resources')
def get_place_resources(place_id):
    place = Place.query.get(place_id)
    if not place:
        return jsonify({'rooms': [], 'tables': []})

    if place.type == 'отель':
        rooms = Room.query.filter_by(place_id=place_id).all()
        return jsonify({'rooms': [room.to_dict() for room in rooms], 'tables': []})

    tables = TableObj.query.filter_by(place_id=place_id).all()
    return jsonify({'rooms': [], 'tables': [table.to_dict() for table in tables]})


@bp.get('/<place_id>/reviews')
def get_place_reviews(place_id):
    reviews = (
        Review.query.filter_by(place_id=place_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return jsonify([review.to_dict() for review in reviews])


@bp.get('/owner/analytics')
@jwt_required()
def owner_analytics():
    user = current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 403

    place = Place.query.filter_by(contact_email=user.email.lower()).first()
    if not place:
        return jsonify({'error': 'Для вашего email не найдено заведение'}), 404

    bookings = Booking.query.filter_by(place_id=place.id).order_by(Booking.created_at.desc()).all()
    reviews = Review.query.filter_by(place_id=place.id).order_by(Review.created_at.desc()).all()

    try:
        ai_analysis = analyze_reviews(reviews)
        ai_analysis['source'] = 'gigachat'
    except Exception:
        ai_analysis = fallback_ai_review_analysis(reviews)

    return jsonify({
        'place': place.to_dict(),
        'summary': {
            'totalBookings': len(bookings),
            'confirmedBookings': len([booking for booking in bookings if booking.status == 'confirmed']),
            'cancelledBookings': len([booking for booking in bookings if booking.status == 'cancelled']),
            'totalGuests': sum(booking.guests or 0 for booking in bookings),
            **review_summary(reviews),
        },
        'aiAnalysis': ai_analysis,
        'recentBookings': [booking.to_dict() for booking in bookings[:8]],
        'recentReviews': [review.to_dict() for review in reviews[:8]],
    })


@bp.post('/<place_id>/reviews')
@jwt_required()
def add_place_review(place_id):
    user_id = current_user_id()
    user = current_user()
    data = request.get_json(silent=True) or {}
    comment = (data.get('comment') or '').strip()
    if not comment:
        return jsonify({'error': 'Review comment is required'}), 400

    try:
        moderation = moderate_text(comment)
    except Exception as error:
        return jsonify({'error': f'Не удалось проверить отзыв через GigaChat: {error}'}), 503

    if not moderation['allowed']:
        return jsonify({'error': moderation['reason']}), 400

    review = Review(
        place_id=place_id,
        user_id=user_id,
        user_name=user.email.split('@')[0],
        rating=data.get('rating', 5),
        comment=comment,
        images=data.get('images', []),
    )
    db.session.add(review)

    place = Place.query.get(place_id)
    if place:
        new_count = place.review_count + 1
        place.rating = ((place.rating * place.review_count) + review.rating) / new_count
        place.review_count = new_count

    db.session.commit()
    return jsonify({'success': True})


@reviews_bp.delete('/<int:review_id>')
@jwt_required()
def delete_review(review_id):
    user_id = current_user_id()
    user = User.query.get(user_id)
    review = Review.query.get(review_id)
    if review and (review.user_id == user_id or user.is_admin):
        place = Place.query.get(review.place_id)
        if place and place.review_count > 0:
            new_count = place.review_count - 1
            place.rating = (
                ((place.rating * place.review_count) - review.rating) / new_count
                if new_count > 0
                else 0
            )
            place.review_count = new_count
        db.session.delete(review)
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'error': 'Unauthorized'}), 403


@bp.post('')
@jwt_required()
@admin_required
def create_place():
    data = request.get_json(silent=True) or {}
    try:
        place_id = str(uuid.uuid4())
        place = Place(
            id=place_id,
            name=data.get('name'),
            type=data.get('type'),
            description=data.get('description'),
            address=data.get('address'),
            city=data.get('city'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            image_url=data.get('imageUrl'),
            images=data.get('images', []),
            contact_phone=data.get('contactPhone'),
            contact_email=data.get('contactEmail'),
            website=data.get('website'),
            average_price=data.get('averagePrice', 0),
        )
        db.session.add(place)
        db.session.commit()
        return jsonify({'success': True, 'id': place_id})
    except Exception as error:
        return jsonify({'error': str(error)}), 400


@bp.put('/<place_id>')
@jwt_required()
@admin_required
def update_place(place_id):
    data = request.get_json(silent=True) or {}
    place = Place.query.get(place_id)
    if not place:
        return jsonify({'error': 'Not found'}), 404

    place.name = data.get('name', place.name)
    place.type = data.get('type', place.type)
    place.description = data.get('description', place.description)
    place.address = data.get('address', place.address)
    place.city = data.get('city', place.city)
    place.latitude = data.get('latitude', place.latitude)
    place.longitude = data.get('longitude', place.longitude)
    place.image_url = data.get('imageUrl', place.image_url)
    place.images = data.get('images', place.images)
    place.contact_phone = data.get('contactPhone', place.contact_phone)
    place.contact_email = data.get('contactEmail', place.contact_email)
    place.website = data.get('website', place.website)
    place.average_price = data.get('averagePrice', place.average_price)
    db.session.commit()
    return jsonify({'success': True})


@bp.delete('/<place_id>')
@jwt_required()
@admin_required
def delete_place(place_id):
    place = Place.query.get(place_id)
    if place:
        if place.type == 'отель':
            Room.query.filter_by(place_id=place_id).delete()
        else:
            TableObj.query.filter_by(place_id=place_id).delete()
        Review.query.filter_by(place_id=place_id).delete()
        Booking.query.filter_by(place_id=place_id).delete()
        db.session.delete(place)
        db.session.commit()
    return jsonify({'success': True})


@bp.post('/<place_id>/resources')
@jwt_required()
@admin_required
def add_place_resource(place_id):
    place = Place.query.get(place_id)
    if not place:
        return jsonify({'error': 'Not found'}), 404

    data = request.get_json(silent=True) or {}
    resource_id = str(uuid.uuid4())
    if place.type == 'отель':
        resource = Room(
            id=resource_id,
            place_id=place_id,
            name=data.get('name'),
            capacity=data.get('capacity'),
            price=data.get('price', 0),
            description='',
            amenities=[],
            image_url='https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
        )
    else:
        resource = TableObj(
            id=resource_id,
            place_id=place_id,
            number=data.get('name'),
            seats=data.get('capacity'),
            x=50.0,
            y=50.0,
            shape='circle',
        )
    db.session.add(resource)
    db.session.commit()
    return jsonify({'success': True, 'id': resource_id})


@bp.delete('/<place_id>/resources/<resource_id>')
@jwt_required()
@admin_required
def delete_place_resource(place_id, resource_id):
    place = Place.query.get(place_id)
    if not place:
        return jsonify({'error': 'Not found'}), 404

    if place.type == 'отель':
        Room.query.filter_by(id=resource_id).delete()
    else:
        TableObj.query.filter_by(id=resource_id).delete()
    db.session.commit()
    return jsonify({'success': True})
