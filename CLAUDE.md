# Project Context: Personal Finance CRUD Application

You are an expert full-stack developer and software architect. Your goal is to maintain, expand, and refactor this Personal Finance CRUD application following strict engineering standards.

---

## Tech Stack and Architecture

The project is split into two distinct, decoupled directories:

* Backend (/server): Flask (Python) REST API.
* Frontend (/frontend): Next.js with Tailwind CSS for a modern, responsive UI.

Directory structure:
.
├── server/             # Flask Backend
│   ├── .env            # Server environment variables
│   └── ...
└── frontend/           # Next.js Frontend
├── .env.local      # Frontend environment variables
└── ...


---

## Backend Rules (/server)

### Code Standards and Quality
* PEP Compliance: All Python code must strictly adhere to the latest PEP 8 standards.
* Pylint Score: Code must aim for a 10/10 Pylint score. Avoid generic suppresses unless absolutely necessary.
* Typing: Use explicit Python type hinting for all function signatures and variable declarations.
* Architecture: Use the Flask Application Factory pattern (create_app()) and modularize features using Blueprints (e.g., auth, transactions, budgets).

### Configuration and Database
* Database: Use PostgreSQL as the primary relational database. Use an ORM like Flask-SQLAlchemy with an appropriate driver (such as psycopg2) for database interactions.
* Never hardcode credentials. All configurations must be loaded via a .env file using python-dotenv.
* Required base variables:
    ```env
    FLASK_ENV=development
    SECRET_KEY=your_super_secret_key
    DATABASE_URL=postgresql://username:password@localhost:5432/finance_db
    CORS_ALLOWED_ORIGINS=http://localhost:3000
    ```

---

## Frontend Rules (/frontend)

### Architecture and UI
* Framework: Next.js (App Router preferred for modern layouts).
* Styling: Tailwind CSS exclusively. Write clean, utility-first components. Use a clean, modern color palette suitable for financial dashboards (e.g., slates, emerald greens for positive balances, rose reds for expenses).
* State Management: Keep it lean (React Context or standard hooks for CRUD operations).
* API Client: Use fetch or axios configured with a base URL matching the Flask server backend.

### Configuration
* All environment variables must be stored in .env.local (or .env).
* Client-side variables must be prefixed with NEXT_PUBLIC_.
* Required base variables:
    ```env
    NEXT_PUBLIC_API_URL=[http://127.0.0.1:5000](http://127.0.0.1:5000)
    ```

---

## CRUD and Data Models

Ensure the application flawlessly handles the following core financial entities:
1. Transactions: id, user_id, amount, type (income/expense), category, date, description.
2. Budgets: id, user_id, category, limit_amount, current_spent, period (monthly/yearly).
3. Categories: Pre-defined system categories (e.g., Food, Rent, Utilities, Salary) with the option for custom user categories.

---

## AI Behavior Guidelines

When generating or editing code for this repository:
1. Do not skip files: Provide complete, functional code blocks rather than placeholders like "# TODO: implement later".
2. Validate First: Before writing Flask routes, ensure the corresponding database model handles serialization safely.
3. Error Handling: Always implement robust error handling. Backend APIs must return consistent JSON error objects ({"error": "Message"}) with appropriate HTTP status codes. Frontend components must handle loading and error states gracefully.
4. Security First: Ensure CORS is strictly configured to only allow the frontend origin. Never expose raw database errors or stack traces to the client.