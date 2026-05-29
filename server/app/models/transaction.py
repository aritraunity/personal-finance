"""Transaction model — individual financial entries."""

import enum
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from ..extensions import db


class TransactionType(str, enum.Enum):
    """Income or expense classification."""

    INCOME = "income"
    EXPENSE = "expense"


class Transaction(db.Model):
    """A single financial transaction."""

    __tablename__ = "transactions"

    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(200), nullable=False)
    amount: Decimal = db.Column(db.Numeric(12, 2), nullable=False)
    type: str = db.Column(
        db.Enum(TransactionType, name="transaction_type_enum", native_enum=False),
        nullable=False,
    )
    category_id: int = db.Column(
        db.Integer, db.ForeignKey("categories.id"), nullable=False
    )
    date: date = db.Column(db.Date, nullable=False)
    merchant: str = db.Column(db.String(200), nullable=True)
    description: str = db.Column(db.Text, nullable=True)
    created_at: datetime = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at: datetime = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize to JSON-safe dict."""
        return {
            "id": self.id,
            "name": self.name,
            "amount": float(self.amount),
            "type": self.type if isinstance(self.type, str) else self.type.value,
            "category_id": self.category_id,
            "category_name": self.category_ref.name if self.category_ref else None,
            "date": self.date.isoformat(),
            "merchant": self.merchant,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
