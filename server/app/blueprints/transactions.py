"""Transactions blueprint — full CRUD with filtering support."""

from datetime import date
from typing import Optional

from flask import Blueprint, jsonify, request
from sqlalchemy import and_
from sqlalchemy.exc import SQLAlchemyError

from ..extensions import db, limiter
from ..models.category import Category
from ..models.transaction import Transaction, TransactionType

bp = Blueprint("transactions", __name__)

_PAGE_SIZE = 50


def _parse_date(value: Optional[str]) -> Optional[date]:
    """Parse ISO date string; return None on any failure."""
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _validate_payload(data: dict) -> Optional[str]:
    """Return an error message if required fields are missing/invalid."""
    if not (data.get("name") or "").strip():
        return "name is required"
    try:
        amount = float(data.get("amount", 0))
        if amount <= 0:
            return "amount must be a positive number"
    except (TypeError, ValueError):
        return "amount must be a number"

    if data.get("type") not in (TransactionType.INCOME, TransactionType.EXPENSE,
                                "income", "expense"):
        return "type must be 'income' or 'expense'"

    if not data.get("category_id"):
        return "category_id is required"

    if not data.get("date"):
        return "date is required"

    try:
        date.fromisoformat(data["date"])
    except ValueError:
        return "date must be a valid ISO date (YYYY-MM-DD)"

    return None


@bp.route("", methods=["GET"])
@limiter.limit("120 per minute")
def list_transactions():
    """List transactions with optional filters and pagination."""
    try:
        filters = []

        date_from = _parse_date(request.args.get("date_from"))
        date_to = _parse_date(request.args.get("date_to"))
        category_id = request.args.get("category_id", type=int)
        tx_type: Optional[str] = request.args.get("type")
        name_q: Optional[str] = request.args.get("name")
        merchant_q: Optional[str] = request.args.get("merchant")
        page: int = max(1, request.args.get("page", 1, type=int))

        if date_from:
            filters.append(Transaction.date >= date_from)
        if date_to:
            filters.append(Transaction.date <= date_to)
        if category_id:
            filters.append(Transaction.category_id == category_id)
        if tx_type in ("income", "expense"):
            filters.append(Transaction.type == tx_type)
        if name_q:
            filters.append(Transaction.name.ilike(f"%{name_q}%"))
        if merchant_q:
            filters.append(Transaction.merchant.ilike(f"%{merchant_q}%"))

        query = (
            Transaction.query.filter(and_(*filters))
            .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        )

        total: int = query.count()
        transactions = query.offset((page - 1) * _PAGE_SIZE).limit(_PAGE_SIZE).all()

        return jsonify(
            {
                "data": [t.to_dict() for t in transactions],
                "total": total,
                "page": page,
                "page_size": _PAGE_SIZE,
                "pages": max(1, -(-total // _PAGE_SIZE)),
            }
        ), 200
    except SQLAlchemyError:
        return jsonify({"error": "Failed to fetch transactions"}), 500


@bp.route("/<int:tx_id>", methods=["GET"])
@limiter.limit("120 per minute")
def get_transaction(tx_id: int):
    """Retrieve a single transaction by ID."""
    tx: Transaction = Transaction.query.get_or_404(
        tx_id, description="Transaction not found"
    )
    return jsonify(tx.to_dict()), 200


@bp.route("", methods=["POST"])
@limiter.limit("60 per minute")
def create_transaction():
    """Create a new transaction."""
    data: dict = request.get_json(silent=True) or {}

    error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    if not Category.query.get(data["category_id"]):
        return jsonify({"error": "Category not found"}), 404

    tx = Transaction(
        name=data["name"].strip(),
        amount=float(data["amount"]),
        type=data["type"],
        category_id=int(data["category_id"]),
        date=date.fromisoformat(data["date"]),
        merchant=(data.get("merchant") or "").strip() or None,
        description=(data.get("description") or "").strip() or None,
    )
    db.session.add(tx)
    try:
        db.session.commit()
        return jsonify(tx.to_dict()), 201
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to create transaction"}), 500


@bp.route("/<int:tx_id>", methods=["PUT"])
@limiter.limit("60 per minute")
def update_transaction(tx_id: int):
    """Update an existing transaction."""
    tx: Transaction = Transaction.query.get_or_404(
        tx_id, description="Transaction not found"
    )
    data: dict = request.get_json(silent=True) or {}

    error = _validate_payload(data)
    if error:
        return jsonify({"error": error}), 400

    if not Category.query.get(data["category_id"]):
        return jsonify({"error": "Category not found"}), 404

    tx.name = data["name"].strip()
    tx.amount = float(data["amount"])
    tx.type = data["type"]
    tx.category_id = int(data["category_id"])
    tx.date = date.fromisoformat(data["date"])
    tx.merchant = (data.get("merchant") or "").strip() or None
    tx.description = (data.get("description") or "").strip() or None

    try:
        db.session.commit()
        return jsonify(tx.to_dict()), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to update transaction"}), 500


@bp.route("/<int:tx_id>", methods=["DELETE"])
@limiter.limit("60 per minute")
def delete_transaction(tx_id: int):
    """Delete a transaction."""
    tx: Transaction = Transaction.query.get_or_404(
        tx_id, description="Transaction not found"
    )
    db.session.delete(tx)
    try:
        db.session.commit()
        return jsonify({"message": "Transaction deleted"}), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Failed to delete transaction"}), 500
