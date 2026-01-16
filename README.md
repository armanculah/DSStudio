# Data Structures Studio
An interactive learning platform for experimenting with fundamental data structures through SVG-powered visualizations and a FastAPI backend.

## TODO
- Polish the new landing hero with illustrations and testimonials.
- Finish queue, array, BST, and heap visualizers plus their saving logic.
- Add richer saved-visualization management (tags, filtering, preview playback).
- Expand the educational copy with more examples, quizzes, and glossary entries.
- Harden backend profile features (picture upload validation, audit trail UI).

## Deployment (Railway)

This app ships as a single Docker service (frontend built into backend) plus a Railway MySQL service.

1. **Provision MySQL on Railway**  
   Add a MySQL service. Capture host, port, database, user, and password.

2. **Service variables** (set on the web service)  
   - `ENV=prod`  
   - `SECRET_KEY=<random strong secret>`  
   - **Database (choose one style):**  
     - `DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:PORT/DBNAME` (use **mysql+pymysql** driver)  
       **or**  
     - `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DB`
   - Optional: `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`

3. **Build/Run on Railway**  
   Railway will build the root `Dockerfile` and expose the app on `$PORT` (default 8000 in dev). The same origin serves:
   - Frontend: `/` (static files)
   - API: `/api/v1/...`

4. **Local Docker test**
   ```bash
   docker build -t dsstudio .
   docker run --rm -e PORT=8000 -p 8000:8000 \
     -e DATABASE_URL="mysql+pymysql://USER:PASSWORD@HOST:PORT/DB" \
     -e SECRET_KEY="dev-secret" \
     dsstudio
   ```
   Then open:
   - Frontend: http://localhost:8000
   - Health: http://localhost:8000/api/v1/health
