from backend import create_app
from backend.extensions import db
from backend.models import Booking, Place, Review, Room, TableObj, User

app = create_app()


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
