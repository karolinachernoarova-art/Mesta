from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from ..extensions import db
from ..models import Booking
from ..security import current_user_id

bp = Blueprint('bookings', __name__, url_prefix='/bookings')


@bp.post('')
@jwt_required()
def create_booking():
    user_id = current_user_id()
    data = request.get_json(silent=True) or {}
    booking = Booking(
        user_id=user_id,
        place_id=data.get('placeId'),
        place_name=data.get('placeName'),
        place_type=data.get('placeType'),
        place_address=data.get('placeAddress'),
        resource_id=data.get('resourceId'),
        resource_name=data.get('resourceName'),
        date=data.get('date'),
        guests=data.get('guests'),
        contact_name=data.get('contactName'),
        contact_phone=data.get('contactPhone'),
        status='confirmed',
    )
    db.session.add(booking)
    db.session.commit()
    return jsonify({'success': True, 'id': booking.id})


@bp.get('')
@jwt_required()
def get_bookings():
    user_id = current_user_id()
    bookings = (
        Booking.query.filter_by(user_id=user_id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return jsonify([booking.to_dict() for booking in bookings])


@bp.route('/<int:booking_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_booking(booking_id):
    user_id = current_user_id()
    data = request.get_json(silent=True) or {}
    booking = Booking.query.get(booking_id)
    if booking and booking.user_id == user_id:
        if 'status' in data:
            booking.status = data['status']
        db.session.commit()
        return jsonify({'success': True})
    return jsonify({'error': 'Unauthorized or not found'}), 403
