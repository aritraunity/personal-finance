"""Budgets blueprint — per-category spending limits."""

from typing import Optional

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from ..extensions import db, limiter
from ..models.budget import Budget, BudgetPeriod
from ..models.category import Category

bp = Blueprint("budgets", __name__)


def _validate_payload(data: dict) -> Optional[str]:
    """Return an error message if the budget payload is invalid."""
    if not data.get("category_id"):
        return "category_id is required"
    try:
        limit = float(data.get("limit_amount", 0))
        if limit <= 0:
            return "limit_amount must be a positive number"
    except (TypeError, ValueError):
        return "limit_amount must be a number"

    if data.get("period") not in (
        BudgetPeriod.MONTHLY, BudgetPeriod.YEARLY, "monthly", "yearly", None
    ):
        return "period must be 'monthly' or 'yearly'"

    return None


@bp.route("", methods=["GET"])
@limiter.limit("120 per minute")
def list_budgets():
    """Return all budgets."""
    try:
        budgets = Budget.query.order_by(Budget.id).all()
        return jsonify([b.to_dict() for b in budgets]), 200
    except SQLAlchemyError:
        return jsonify({"error": "Failed to fetch budgets"}), 500


@bp.route("", methods=["POST"])
@limiter.limit("30 per minute")
def create_budget():
    """Create a new category budget."""
    data: dict = request.get_json(silent=True) or {}

    error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    if not Category.query.get(data["category_id"]):
        return jsonify({"error": "Category not found"}), 404

    period = data.get("period", "monthly")
    budget = Budget(
        category_id=int(data["category_id"]),
        limit_amount=float(data["limit_amount"]),
        current_spent=float(data.get("current_spent", 0)),
        period=period,
    )
    db.session.add(budget)
    try:
        db.session.commit()
        return jsonify(budget.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A budget for that category already exists"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to create budget"}), 500


@bp.route("/<int:budget_id>", methods=["PUT"])
@limiter.limit("30 per minute")
def update_budget(budget_id: int):
    """Update a budget's limit or spent amount."""
    budget: Budget = Budget.query.get_or_404(
        budget_id, description="Budget not found"
    )
    data: dict = request.get_json(silent=True) or {}

    if "limit_amount" in data:
        try:
            limit = float(data["limit_amount"])
            if limit <= 0:
                return jsonify({"error": "limit_amount must be positive"}), 400
            budget.limit_amount = limit
        except (TypeError, ValueError):
            return jsonify({"error": "limit_amount must be a number"}), 400

    if "current_spent" in data:
        try:
            spent = float(data["current_spent"])
            if spent < 0:
                return jsonify({"error": "current_spent cannot be negative"}), 400
            budget.current_spent = spent
        except (TypeError, ValueError):
            return jsonify({"error": "current_spent must be a number"}), 400

    if data.get("period") in ("monthly", "yearly"):
        budget.period = data["period"]

    try:
        db.session.commit()
        return jsonify(budget.to_dict()), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to update budget"}), 500


@bp.route("/<int:budget_id>", methods=["DELETE"])
@limiter.limit("30 per minute")
def delete_budget(budget_id: int):
    """Delete a budget."""
    budget: Budget = Budget.query.get_or_404(
        budget_id, description="Budget not found"
    )
    db.session.delete(budget)
    try:
        db.session.commit()
        return jsonify({"message": "Budget deleted"}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to delete budget"}), 500
