import time

from .extensions import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    photo_url = db.Column(db.Text)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.Float, default=time.time)

    def to_public_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'isAdmin': self.is_admin,
            'uid': str(self.id),
            'photoUrl': self.photo_url,
        }


class Place(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50))
    description = db.Column(db.Text)
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    image_url = db.Column(db.String(500))
    images = db.Column(db.JSON)
    contact_phone = db.Column(db.String(50))
    contact_email = db.Column(db.String(120))
    website = db.Column(db.String(255))
    rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    average_price = db.Column(db.Float, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'description': self.description,
            'address': self.address,
            'city': self.city,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'imageUrl': self.image_url,
            'images': self.images or [],
            'contactPhone': self.contact_phone,
            'contactEmail': self.contact_email,
            'website': self.website,
            'rating': self.rating,
            'reviewCount': self.review_count,
            'averagePrice': self.average_price,
        }


class Room(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    place_id = db.Column(db.String(50), db.ForeignKey('place.id'))
    name = db.Column(db.String(255))
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    capacity = db.Column(db.Integer)
    amenities = db.Column(db.JSON)
    image_url = db.Column(db.String(500))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'capacity': self.capacity,
            'amenities': self.amenities or [],
        }


class TableObj(db.Model):
    __tablename__ = 'tables'

    id = db.Column(db.String(50), primary_key=True)
    place_id = db.Column(db.String(50), db.ForeignKey('place.id'))
    number = db.Column(db.String(50))
    seats = db.Column(db.Integer)
    x = db.Column(db.Float)
    y = db.Column(db.Float)
    shape = db.Column(db.String(50))
    is_available = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'number': self.number,
            'seats': self.seats,
            'x': self.x,
            'y': self.y,
            'shape': self.shape,
            'isAvailable': self.is_available,
        }


class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    place_id = db.Column(db.String(50), db.ForeignKey('place.id'))
    place_name = db.Column(db.String(255))
    place_type = db.Column(db.String(50))
    place_address = db.Column(db.String(255))
    resource_id = db.Column(db.String(50))
    resource_name = db.Column(db.String(255))
    date = db.Column(db.String(100))
    guests = db.Column(db.Integer)
    contact_name = db.Column(db.String(255))
    contact_phone = db.Column(db.String(50))
    status = db.Column(db.String(50), default='confirmed')
    created_at = db.Column(db.Float, default=time.time)

    def to_dict(self):
        return {
            'id': self.id,
            'placeId': self.place_id,
            'placeName': self.place_name,
            'placeType': self.place_type,
            'placeAddress': self.place_address,
            'resourceId': self.resource_id,
            'resourceName': self.resource_name,
            'date': self.date,
            'guests': self.guests,
            'status': self.status,
            'contactName': self.contact_name,
            'contactPhone': self.contact_phone,
            'createdAt': self.created_at,
        }


class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    place_id = db.Column(db.String(50), db.ForeignKey('place.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user_name = db.Column(db.String(255))
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)
    images = db.Column(db.JSON)
    created_at = db.Column(db.Float, default=time.time)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': str(self.user_id),
            'userName': self.user_name,
            'rating': self.rating,
            'comment': self.comment,
            'images': self.images or [],
            'createdAt': self.created_at * 1000,
        }
