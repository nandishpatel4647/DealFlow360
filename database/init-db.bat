@echo off
REM ===================================================================
REM DealFlow360 — PostgreSQL Local Database Initialization Script
REM Uses local PostgreSQL 18 on localhost:5432
REM ===================================================================

SET PGPATH=C:\Program Files\PostgreSQL\18\bin
SET PGDATABASE=dealflow360
SET PGUSER=postgres
if "%PGPASSWORD%"=="" SET PGPASSWORD=postgres
SET PGPORT=5432
SET PGHOST=localhost

echo [1/3] Checking PostgreSQL service...
net start postgresql-x64-18 >nul 2>&1

echo [2/3] Creating database "%PGDATABASE%" if it does not exist...
"%PGPATH%\createdb.exe" -h %PGHOST% -p %PGPORT% -U %PGUSER% %PGDATABASE% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Database "%PGDATABASE%" created successfully!
) else (
    echo Database "%PGDATABASE%" already exists or check password.
)

echo [3/3] Applying schema and seed data from schema.sql...
"%PGPATH%\psql.exe" -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -f "%~dp0schema.sql"

echo.
echo ===================================================================
echo PostgreSQL Schema applied successfully to local database %PGDATABASE%!
echo ===================================================================
pause
