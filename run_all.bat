@echo off
echo Starting backend...
start cmd /k "cd backend && mvn spring-boot:run"

echo Starting frontend...
start cmd /k "cd frontend && npm install && npm run dev"

echo Application is starting in separate windows.
echo Note: Ensure PostgreSQL is running and the database 'smart_query_builder' exists.
