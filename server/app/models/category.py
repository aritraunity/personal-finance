"""Category model — system-defined and user-defined spending categories."""

from typing import Any

from ..extensions import db

SYSTEM_CATEGORIES: list[str] = [
    "Food & Dining",
    "Rent & Housing",
    "Utilities",
    "Transportation",
    "Healthcare",
    "Shopping",
    "Entertainment",
    "Salary",
    "Freelance",
    "Investments",
    "Education",
    "Travel",
    "Subscriptions",
    "Other",
]


class Category(db.Model):
    """Spending/earning category."""

    __tablename__ = "categories"

    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(100), nullable=False, unique=True)
    is_system: bool = db.Column(db.Boolean, default=False, nullable=False)
    icon: str = db.Column(db.String(50), nullable=True)

    transactions = db.relationship(
        "Transaction", backref="category_ref", lazy="dynamic"
    )
    budgets = db.relationship(
        "Budget", backref="category_ref", lazy="dynamic"
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize to JSON-safe dict."""
        return {
            "id": self.id,
            "name": self.name,
            "is_system": self.is_system,
            "icon": self.icon,
        }

    @classmethod
    def seed_system_categories(cls) -> None:
        """Insert system categories if they don't exist."""
        for name in SYSTEM_CATEGORIES:
            if not cls.query.filter_by(name=name).first():
                db.session.add(cls(name=name, is_system=True))
        db.session.commit()
