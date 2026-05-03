Write-Host "Starting backend..."

Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; mvn spring-boot:run`""

Write-Host "Starting frontend..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm install; npm run dev`""

Write-Host "Application is starting in separate windows."
Write-Host "Note: Ensure PostgreSQL is running and the database 'smart_query_builder' exists."
