# Finance Tracker

A full-stack personal finance CRUD application for tracking daily transactions and managing category budgets.

![Personal Finance Interface](public\ui.png)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python · Flask · Flask-SQLAlchemy · Flask-Limiter · Flask-CORS |
| Database | PostgreSQL (via psycopg2) |
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| Icons | Google Material Symbols |

---

## Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** 14+ running locally (default port 5432)

---

## Quick Start

### 1. Clone and enter the project

```bash
git clone <repo-url>
cd crud
```

### 2. Backend setup

```bash
cd server

# Create and activate a virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials (see Environment Variables below)

# Start the development server
python run.py
```

The API will be available at `http://127.0.0.1:5000`.  
All database tables are created automatically on first run. System categories are seeded on startup.

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if your API runs on a different port

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

### Backend — `server/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | `development` or `production` | `development` |
| `SECRET_KEY` | Flask secret key — change before deploying | — |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/finance_db` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:3000` |

### Frontend — `frontend/.env.local`

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the Flask API | `http://127.0.0.1:5000` |

---

## API Reference

All endpoints are prefixed with `/api`. Responses use `Content-Type: application/json`.  
Errors return `{ "error": "message" }` with an appropriate HTTP status code.

### Categories

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/categories` | List all categories |
| `POST` | `/api/categories` | Create a custom category `{ name }` |
| `DELETE` | `/api/categories/:id` | Delete a custom category (system categories are protected) |
| `POST` | `/api/categories/seed` | Seed the 14 built-in system categories (idempotent) |

### Transactions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/transactions` | List transactions with optional filters (see below) |
| `GET` | `/api/transactions/:id` | Get a single transaction |
| `POST` | `/api/transactions` | Create a transaction |
| `PUT` | `/api/transactions/:id` | Update a transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |

**Filter query parameters for `GET /api/transactions`:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `date_from` | `YYYY-MM-DD` | Transactions on or after this date |
| `date_to` | `YYYY-MM-DD` | Transactions on or before this date |
| `category_id` | integer | Filter by category |
| `type` | `income` \| `expense` | Filter by transaction type |
| `name` | string | Case-insensitive substring search on name |
| `merchant` | string | Case-insensitive substring search on merchant |
| `page` | integer | Page number (50 rows per page, default 1) |

**Transaction payload fields:**

```json
{
  "name": "Grocery run",
  "amount": 47.50,
  "type": "expense",
  "category_id": 1,
  "date": "2026-05-29",
  "merchant": "Whole Foods",
  "description": "Weekly shop"
}
```

### Budgets

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/budgets` | List all budgets |
| `POST` | `/api/budgets` | Create a budget |
| `PUT` | `/api/budgets/:id` | Update a budget's limit, spent amount, or period |
| `DELETE` | `/api/budgets/:id` | Delete a budget |

**Budget payload fields:**

```json
{
  "category_id": 1,
  "limit_amount": 500.00,
  "current_spent": 120.00,
  "period": "monthly"
}
```

### Rate Limits

| Operation | Limit |
|-----------|-------|
| Read (`GET`) | 120 requests / minute |
| Write (`POST`, `PUT`) | 60 requests / minute |
| Delete | 30 requests / minute |

Limits are tracked per IP address using in-memory storage. Exceeding a limit returns `HTTP 429`.

---

## Project Structure

```
crud/
├── server/                     # Flask backend
│   ├── app/
│   │   ├── __init__.py         # Application factory (create_app)
│   │   ├── extensions.py       # SQLAlchemy + Flask-Limiter instances
│   │   ├── models/
│   │   │   ├── category.py     # Category model + system seed data
│   │   │   ├── transaction.py  # Transaction model
│   │   │   └── budget.py       # Budget model
│   │   └── blueprints/
│   │       ├── categories.py   # /api/categories routes
│   │       ├── transactions.py # /api/transactions routes
│   │       └── budgets.py      # /api/budgets routes
│   ├── run.py                  # Development entry point
│   ├── requirements.txt
│   └── .env                    # ← not committed; copy from .env.example
│
└── frontend/                   # Next.js frontend
    ├── app/
    │   ├── layout.tsx          # Root layout (fonts, AppShell)
    │   ├── page.tsx            # Transactions dashboard
    │   └── budgets/
    │       └── page.tsx        # Budgets page
    ├── components/
    │   ├── AppShell.tsx        # Sidebar + mobile header wrapper
    │   ├── Sidebar.tsx         # Fixed left navigation
    │   ├── Icon.tsx            # Material Symbols wrapper
    │   ├── StatCard.tsx        # KPI summary card (+ skeleton)
    │   ├── FilterBar.tsx       # Transaction filter controls
    │   ├── TransactionList.tsx # Table / mobile card list (+ skeleton)
    │   ├── TransactionForm.tsx # Add / edit modal form
    │   ├── BudgetCard.tsx      # Budget progress card (+ skeleton)
    │   ├── BudgetForm.tsx      # Add / edit budget modal
    │   └── DeleteConfirmModal.tsx
    ├── lib/
    │   ├── api.ts              # Typed API client (fetch wrapper)
    │   └── types.ts            # Shared TypeScript interfaces
    └── .env.local              # ← not committed; copy from .env.example
```

---

## Database

Tables are created automatically via `db.create_all()` when the Flask app starts.  
No migration tool is required for initial setup.

### Schema overview

**categories** — `id`, `name` (unique), `is_system`, `icon`  
**transactions** — `id`, `name`, `amount`, `type`, `category_id` (FK), `date`, `merchant`, `description`, `created_at`, `updated_at`  
**budgets** — `id`, `category_id` (FK), `limit_amount`, `current_spent`, `period`

Connection pooling is configured with `pool_size=5`, `max_overflow=10`, `pool_recycle=1800s`, and `pool_pre_ping=True`.

---

## Development Notes

- The backend enforces CORS strictly — only the origin specified in `CORS_ALLOWED_ORIGINS` is allowed.
- Stack traces and raw database errors are never sent to the client; all error responses use `{ "error": "..." }`.
- System categories cannot be deleted via the API (`HTTP 403`).
- The frontend auto-seeds system categories on first load if the categories list is empty.
