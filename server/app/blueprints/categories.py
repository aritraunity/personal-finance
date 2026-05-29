"""Categories blueprint — list and manage spending categories."""

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from ..extensions import db, limiter
from ..models.category import Category

bp = Blueprint("categories", __name__)


@bp.route("", methods=["GET"])
@limiter.limit("120 per minute")
def list_categories():
    """Return all categories ordered alphabetically."""
    try:
        categories = Category.query.order_by(Category.name).all()
        return jsonify([c.to_dict() for c in categories]), 200
    except SQLAlchemyError:
        return jsonify({"error": "Failed to fetch categories"}), 500


@bp.route("", methods=["POST"])
@limiter.limit("30 per minute")
def create_category():
    """Create a custom user category."""
    data: dict = request.get_json(silent=True) or {}
    name: str = (data.get("name") or "").strip()

    if not name:
        return jsonify({"error": "Category name is required"}), 400
    if len(name) > 100:
        return jsonify({"error": "Name must be 100 characters or fewer"}), 400

    category = Category(name=name, is_system=False, icon=data.get("icon"))
    db.session.add(category)
    try:
        db.session.commit()
        return jsonify(category.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A category with that name already exists"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to create category"}), 500


@bp.route("/<int:category_id>", methods=["DELETE"])
@limiter.limit("30 per minute")
def delete_category(category_id: int):
    """Delete a user-created category (system categories are protected)."""
    category: Category = Category.query.get_or_404(
        category_id, description="Category not found"
    )

    if category.is_system:
        return jsonify({"error": "System categories cannot be deleted"}), 403

    db.session.delete(category)
    try:
        db.session.commit()
        return jsonify({"message": "Category deleted"}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to delete category"}), 500


@bp.route("/seed", methods=["POST"])
@limiter.limit("5 per minute")
def seed_categories():
    """Seed system categories (idempotent — safe to call multiple times)."""
    try:
        Category.seed_system_categories()
        return jsonify({"message": "System categories seeded"}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to seed categories"}), 500
