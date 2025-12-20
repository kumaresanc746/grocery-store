# Database Initialization - PowerShell Script
# Run this after deploying to create admin user and sample data

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Database Initialization" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "c:\Users\madur\Downloads\grocery-store-main (7)\grocery-store-main"

# Note: This script is for documentation
# Actual initialization should be run on Ubuntu server using init-database.sh

Write-Host "To initialize the database:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Upload these files to your Ubuntu server:" -ForegroundColor White
Write-Host "   - mongo-init.js"
Write-Host "   - init-database.sh"
Write-Host ""
Write-Host "2. On Ubuntu server, run:" -ForegroundColor White
Write-Host "   cd ~/grocery-store"
Write-Host "   chmod +x init-database.sh"
Write-Host "   ./init-database.sh"
Write-Host ""
Write-Host "3. Or use Git:" -ForegroundColor White
Write-Host "   git add mongo-init.js init-database.sh"
Write-Host "   git commit -m 'Add database initialization scripts'"
Write-Host "   git push"
Write-Host ""
Write-Host "   Then on Ubuntu:"
Write-Host "   cd ~/grocery-store"
Write-Host "   git pull"
Write-Host "   chmod +x init-database.sh"
Write-Host "   ./init-database.sh"
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Green
Write-Host "  Email: admin@grocerystore.com"
Write-Host "  Password: admin123"
Write-Host ""
