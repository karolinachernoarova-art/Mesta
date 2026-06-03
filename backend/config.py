import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'MYSQL_URL',
        'mysql+pymysql://root:root@localhost/restbook',
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-only-change-me')
    STATIC_FOLDER = os.environ.get('STATIC_FOLDER', 'dist')
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))


class ProductionConfig(Config):
    @classmethod
    def validate(cls):
        if cls.JWT_SECRET_KEY in {'dev-only-change-me', 'super-secret-default-key'}:
            raise RuntimeError('Set a strong JWT_SECRET_KEY in production.')


def load_config():
    if os.environ.get('FLASK_ENV') == 'production':
        ProductionConfig.validate()
        return ProductionConfig
    return Config
