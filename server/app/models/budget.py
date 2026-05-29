"""Budget model — per-category spending limits."""

import enum
from decimal import Decimal
from typing import Any

from ..extensions import db


class BudgetPeriod(str, enum.Enum):
    """Budget recurrence period."""

    MONTHLY = "monthly"
    YEARLY = "yearly"


class Budget(db.Model):
    """A spending budget for a category over a period."""

    __tablename__ = "budgets"

    id: int = db.Column(db.Integer, primary_key=True)
    category_id: int = db.Column(
        db.Integer, db.ForeignKey("categories.id"), nullable=False
    )
    limit_amount: Decimal = db.Column(db.Numeric(12, 2), nullable=False)
    current_spent: Decimal = db.Column(
        db.Numeric(12, 2), nullable=False, default=0
    )
    period: str = db.Column(
        db.Enum(BudgetPeriod, name="budget_period_enum", native_enum=False),
        nullable=False,
        default=BudgetPeriod.MONTHLY,
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize to JSON-safe dict."""
        limit: float = float(self.limit_amount)
        spent: float = float(self.current_spent)
        return {
            "id": self.id,
            "category_id": self.category_id,
            "category_name": self.category_ref.name if self.category_ref else None,
            "limit_amount": limit,
            "current_spent": spent,
            "remaining": round(limit - spent, 2),
            "utilization_pct": round((spent / limit * 100) if limit else 0, 1),
            "period": self.period if isinstance(self.period, str) else self.period.value,
        }
