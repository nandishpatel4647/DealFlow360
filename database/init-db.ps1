# ===================================================================
# DealFlow360 — PostgreSQL Local Database Initialization Script (PowerShell)
# Architecture: Local PostgreSQL 18 (localhost:5432)
# ===================================================================

$PgBin = "C:\Program Files\PostgreSQL\18\bin"
$DbName = "dealflow360"
$DbUser = "postgres"
$DbHost = "localhost"
$DbPort = "5432"
if (-not $env:PGPASSWORD) { $env:PGPASSWORD = "postgres" }

Write-Host "==> Ensuring PostgreSQL Service is running..." -ForegroundColor Cyan
Get-Service -Name "postgresql-x64-18" | Start-Service -ErrorAction SilentlyContinue

Write-Host "==> Creating PostgreSQL database '$DbName'..." -ForegroundColor Cyan
& "$PgBin\createdb.exe" -h $DbHost -p $DbPort -U $DbUser $DbName 2>$null

Write-Host "==> Applying schema & seed data from schema.sql..." -ForegroundColor Cyan
$SchemaPath = Join-Path $PSScriptRoot "schema.sql"
& "$PgBin\psql.exe" -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $SchemaPath

Write-Host "`n✓ DealFlow360 PostgreSQL Database initialized successfully!" -ForegroundColor Green
