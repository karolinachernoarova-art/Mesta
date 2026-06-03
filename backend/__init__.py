from pathlib import Path

from flask import Flask

from .config import load_config
from .extensions import db, jwt, migrate
from .routes.ai import bp as ai_bp
from .routes.auth import bp as auth_bp
from .routes.bookings import bp as bookings_bp
from .routes.frontend import bp as frontend_bp
from .routes.health import bp as health_bp
from .routes.places import bp as places_bp, reviews_bp
from .routes.uploads import bp as uploads_bp


def create_app(config_object=None):
    config = config_object or load_config()
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config)
    app.config['STATIC_FOLDER'] = str(Path(__file__).resolve().parent.parent / 'dist')

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(places_bp, url_prefix='/api/places')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
    app.register_blueprint(frontend_bp)

    return app
