# Testing Guide

## Frontend
- Install deps: `cd frontend && npm install`
- Unit tests (Vitest): `npm run test`
- Watch mode: `npm run test:watch`
- E2E (Playwright):
  - Install browsers: `cd frontend && npx playwright install --with-deps`
  - Run (needs app running, e.g., Docker image on :8000): `BASE_URL=http://localhost:8000 npm run test:e2e`
  - Smoke covers landing page + playground insert/render.

## Backend
- Install deps: `cd backend && pip install -r requirements.txt`
- Run tests (smoke + auth/saved viz/profile picture):  
  `ENV=test SECRET_KEY=testing DATABASE_URL=sqlite:///./test.db pytest`
  - `ENV=test` skips DB ping/init_db and uses sqlite.
  - Tests create tables automatically and isolate MEDIA_ROOT to a temp dir.

## CI / Branches
- Workflows run on pushes to `testing` and PRs to `main`:
  - `frontend-tests.yml`: Vitest unit tests.
  - `backend-tests.yml`: pytest suite with `ENV=test`.
  - `e2e-tests.yml`: builds Docker image, runs container in test mode, then Playwright smoke tests against `http://localhost:8000`.
- Railway deploys from `main` (unchanged).
