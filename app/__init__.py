from flask import Flask
from config import config
from app import main


def create_app():
    app = Flask(__name__, static_folder="static")
    app.config.from_object(config)
    app.register_blueprint(main.bp)

    return app
