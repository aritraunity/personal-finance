"""Flask application factory."""

import os
from typing import Optional

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from .extensions import db, limiter

load_dotenv()


def create_app(test_config: Optional[dict] = None) -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__, instance_relative_config=True)

    _configure(app, test_config)
    _init_extensions(app)
    _register_blueprints(app)
    _ensure_schema(app)

    return app


def _configure(app: Flask, test_config: Optional[dict]) -> None:
    """Load configuration from environment or test overrides."""
    app.config["SECRET_KEY"] = os.environ["SECRET_KEY"]
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 1800,
        "pool_pre_ping": True,
    }
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if test_config:
        app.config.update(test_config)


def _init_extensions(app: Flask) -> None:
    """Bind extensions to the app instance."""
    db.init_app(app)
    limiter.init_app(app)

    origins: str = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
    CORS(app, origins=origins.split(","), supports_credentials=True)


def _register_blueprints(app: Flask) -> None:
    """Register all feature blueprints."""
    from .blueprints.categories import bp as categories_bp
    from .blueprints.transactions import bp as transactions_bp
    from .blueprints.budgets import bp as budgets_bp

    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(transactions_bp, url_prefix="/api/transactions")
    app.register_blueprint(budgets_bp, url_prefix="/api/budgets")


def _ensure_schema(app: Flask) -> None:
    """Create all tables (idempotent) and seed reference data.

    Must run after blueprints are registered so every model has been
    imported and added to SQLAlchemy's metadata before create_all().
    """
    # Explicit imports guarantee metadata is populated even if a blueprint
    # import chain changes in the future.
    from .models.category import Category  # noqa: F401
    from .models.transaction import Transaction  # noqa: F401
    from .models.budget import Budget  # noqa: F401

    with app.app_context():
        db.create_all()
        Category.seed_system_categories()
