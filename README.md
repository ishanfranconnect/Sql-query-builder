# Smart Query Builder

Production-ready full-stack starter for visual SQL building.

## Project Structure

- `backend`: Java Spring Boot API with JWT auth, query engine, query management, admin APIs.
- `frontend`: React + Material UI + Redux Toolkit app with auth and query-builder flows.

## Backend Features

- Clean layering: controller, service, repository, DTO, security, query engine.
- JWT authentication with BCrypt password hashing.
- Register, login, email verification, forgot/reset password.
- Roles: `ROLE_USER`, `ROLE_ADMIN`.
- Query IR to SQL generation (`SELECT`, `WHERE`, `JOIN`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT/OFFSET`, `DISTINCT`).
- Safe query execution with parameterized values.
- Query save/list/delete APIs.
- Metadata tables:
  - `tables_metadata`
  - `columns_metadata`
  - `relationships_metadata`

## Frontend Features

- Pages:
  - Login
  - Register
  - Dashboard
  - Query Builder
  - Saved Queries
  - Admin Panel
- Axios API layer and JWT interceptor.
- Redux Toolkit state slices for auth and query data.
- Material UI based layout.

## Setup Instructions

### 1) Backend

```bash
cd backend
mvn spring-boot:run
```

Environment variables:

- `DB_URL` (default: `jdbc:postgresql://localhost:5432/smart_query_builder`)
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `FRONTEND_URL` (default: `http://localhost:5173`)

Backend runs on: `http://localhost:8080`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Key API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/verify?token=...`
- `POST /api/auth/forgot-password?email=...`
- `POST /api/auth/reset-password?token=...&password=...`
- `POST /api/queries/generate`
- `POST /api/queries/execute`
- `POST /api/queries/save`
- `GET /api/queries`
- `DELETE /api/queries/{id}`
- `GET /api/admin/users`

## Notes

- Frontend build is verified.
- Backend compile may require local network access to download Maven dependencies the first time.
