# Data Structures Studio

An interactive learning platform for experimenting with fundamental data structures. The frontend (Vite + vanilla JS) renders SVG visualizations of stacks, queues, linked lists, arrays, BSTs, and heaps. The backend (FastAPI + SQLModel + MySQL/PyMySQL) provides authentication, saved visualizations, and profile picture uploads. Production is deployed as a single Railway service: the backend serves the built frontend assets and the API at the same origin.

## Architecture
- **Frontend**: Vite multi-page app. HTML entry points in `frontend/index.html` and `frontend/views/*.html`. Pure data structure logic lives in `frontend/src/algorithms/structures/*.js`; SVG renderers in `frontend/src/visualizers/structures/*.js`; orchestration in `frontend/src/playground.js`.
- **Backend**: FastAPI app in `backend/app`. Routers:
  - `/api/v1/health` — readiness checks
  - `/api/v1/auth/*` — register/login/logout/me (cookie-based JWT)
  - `/api/v1/profile/*` — profile update, password change, profile picture upload, saved visualizations CRUD
- **Static serving**: In production, `frontend/dist` is copied to `backend/static` and served by FastAPI; APIs stay under `/api/v1/*`.

## Tech Stack
- Frontend: Vite, vanilla JS, Tailwind-style utilities, Vitest, Playwright (smoke).
- Backend: FastAPI, SQLModel/SQLAlchemy, PyMySQL, python-jose, passlib/bcrypt, pytest.
- Deployment: Docker multi-stage build, Railway single service, MySQL database.

## Local Development
### Prereqs
- Node 20+
- Python 3.12+
- MySQL for full backend; SQLite works for tests/smoke.

### Frontend
```bash
cd frontend
npm install
npm run dev        # Vite dev server (proxied to backend :8000 for /api)
npm run build      # build to dist
```

### Backend
```bash
cd backend
pip install -r requirements.txt
ENV=dev SECRET_KEY=changeme DATABASE_URL="mysql+pymysql://user:pass@localhost:3306/db" uvicorn app.main:app --reload --port 8000
```

## Environment Variables
- `SECRET_KEY` (required in prod)
- `DATABASE_URL` (preferred) or `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DB`
- `ENV` (`dev` | `prod` | `test`) — CORS dev-only, test skips DB ping
- `MEDIA_ROOT` (path for uploads; in prod use a persistent volume, e.g., `/data/media`)
- `MEDIA_URL` (defaults to `/media`)

## Testing
- **Frontend unit (Vitest)**: `cd frontend && npm run test`
- **Frontend E2E (Playwright)**: `cd frontend && npx playwright install --with-deps && BASE_URL=http://localhost:8000 npm run test:e2e` (requires app running)
- **Backend tests (pytest)**: `cd backend && ENV=test SECRET_KEY=testing DATABASE_URL=sqlite:///./test.db pytest`
  - Test mode skips DB ping; tables are created for SQLite; media path isolated to a temp dir in tests.
- GitHub Actions run these on pushes to `testing` and PRs into `main` (`frontend-tests.yml`, `backend-tests.yml`, `e2e-tests.yml`).

## API Documentation
- Swagger UI: `/api/v1/docs`
- OpenAPI JSON: `/api/v1/openapi.json`
- Tags:
  - `health`: readiness checks
  - `auth`: register/login/logout/me
  - `profile`: profile update, password change, profile picture upload, saved visualizations CRUD
- Example save visualization payload (POST `/api/v1/profile/me/saved-visualizations`):
  ```json
  {
    "name": "Stack example",
    "kind": "stack",
    "payload": [7, 3, -2, 5]
  }
  ```

## Deployment (Railway)
- Single service runs FastAPI at `${PORT:-8000}`, serving built frontend from `backend/static`.
- Dockerfile multi-stage: builds frontend, copies `dist` into backend image, runs `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`.
- Attach Railway MySQL service; set `DATABASE_URL` (mysql+pymysql://...), `SECRET_KEY`, `ENV=prod`, and `MEDIA_ROOT` to a mounted volume (e.g., `/data/media`) for profile pictures.
- Health check: `/api/v1/health`.
- Swagger documentation: `/api/v1/docs`.
