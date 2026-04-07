# WC-Advisor — Claude Code Context

## Project
Full-stack app for finding and reviewing public bathrooms.
Final-year school project (LINKIA). Nearly complete.

## Tech Stack
- **Frontend:** Angular 21, standalone components, Signals + computed (no NgRx)
- **Maps:** Leaflet 1.9.4 + OpenStreetMap
- **Backend:** FastAPI + Uvicorn, SQLAlchemy 2.0, Alembic, PostgreSQL 16
- **Auth:** JWT (python-jose) + bcrypt
- **Infra:** Docker Compose + Nginx reverse proxy

## Current State
- Auth, CRUD, reviews, favorites, map, filters, Docker: ✅ complete
- In progress: refactoring WC state/filtering → `wcs/state/`, `wcs/components/`, `wcs/utils/`
- 11 files with uncommitted changes

## Architecture Rules
- Signals-first: use `signal()` + `computed()`, never NgRx
- Standalone components only, no NgModules
- Lazy-loaded feature routes
- Backend pattern: routers/ → crud/ → models.py
- One review per user per WC (enforced at DB level)

## Key Conventions
- Mobile-first CSS, no UI libraries
- Prod: Nginx routes `/api/*` → FastAPI, else → Angular SPA
- Environment separation: docker-compose.yml (dev) vs docker-compose.prod.yml (prod)

## Current Priority
Finish the WC state/filtering refactor, then prepare for final delivery.
