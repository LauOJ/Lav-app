# Lavapp

**[lavapp.net](https://lavapp.net)** — collaborative map for finding and reviewing public bathrooms, with a focus on accessibility and inclusion.

Add locations, rate cleanliness and safety, filter by accessibility or gender-neutral facilities, and report places that no longer exist. Available in Catalan and Spanish.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21, Signals, Leaflet + OpenStreetMap |
| Backend | FastAPI, SQLAlchemy 2.0, Alembic |
| Database | PostgreSQL 16 |
| Auth | JWT (python-jose) + bcrypt |
| Infra | Docker Compose, Nginx, Let's Encrypt SSL |
| i18n | ngx-translate (Catalan + Spanish) |

---

## Running locally

The standard dev setup runs only the database in Docker; backend and frontend run locally.

### Prerequisites

- Docker Desktop
- Node.js + npm
- Python 3.12

### 1. Start the database

```bash
docker compose up db
```

### 2. Start the backend

```bash
cd backend

# First time only:
python -m venv venv
pip install -r requirements.txt

# Activate the virtual environment (Windows)
venv\Scripts\activate
# or (macOS/Linux)
source venv/bin/activate

# Apply database migrations (first time and after pulling new ones)
alembic upgrade head

uvicorn main:app --reload
```

API available at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm start
```

App available at `http://localhost:4200`.

### Alternative: everything in Docker

```bash
docker compose up
```

- Frontend: `http://localhost:4201`
- Backend: `http://localhost:8001`

---

## Project structure

```
wc-advisor/
├── backend/
│   ├── routers/       # FastAPI route handlers
│   ├── crud/          # Database operations
│   ├── schemas/       # Pydantic request/response models
│   ├── alembic/       # Database migrations
│   └── models.py      # SQLAlchemy ORM models
└── frontend/
    └── src/app/
        ├── features/  # Lazy-loaded feature modules
        │   ├── explore/   # Map + WC detail sheet
        │   ├── wcs/       # Add/edit WC forms, state
        │   ├── reviews/   # Review list and form
        │   ├── auth/      # Login, register
        │   └── profile/   # User profile, account settings
        └── shared/    # Reusable components, services
```

---

## Features

- Interactive map with geolocation and bounding-box queries
- WC detail sheet with scores, tags, reviews, and distance
- Add and edit WCs with accessibility, gender, cleanliness, and safety fields
- One review per user per WC (enforced at DB level), editable
- Favorites
- Filters: accessibility, gender-neutral, cleanliness, safety, opening hours
- Report a WC as closed (auto-deactivates at 3 reports)
- User accounts: register, login, edit profile, change password, delete account
- Mobile-first, no UI library
