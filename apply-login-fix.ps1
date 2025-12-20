# Login Fix Deployment Script for Windows PowerShell
# This script applies the fixes for login and admin connection errors

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Applying Login Connection Fixes" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in Kubernetes environment
if (Get-Command kubectl -ErrorAction SilentlyContinue) {
    Write-Host "✓ kubectl found - Kubernetes environment detected" -ForegroundColor Green
    Write-Host ""
    
    # Apply updated ConfigMap
    Write-Host "1. Applying updated frontend ConfigMap..." -ForegroundColor Yellow
    kubectl apply -f k8s/frontend-configmap.yaml
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ ConfigMap applied successfully" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed to apply ConfigMap" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "2. Restarting frontend deployment to pick up new config..." -ForegroundColor Yellow
    kubectl rollout restart deployment/frontend -n grocery-store
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Frontend deployment restarted" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed to restart frontend" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "3. Waiting for rollout to complete..." -ForegroundColor Yellow
    kubectl rollout status deployment/frontend -n grocery-store --timeout=60s
    
    Write-Host ""
    Write-Host "4. Getting service information..." -ForegroundColor Yellow
    kubectl get svc -n grocery-store
    
    Write-Host ""
    Write-Host "5. Getting node IP addresses..." -ForegroundColor Yellow
    kubectl get nodes -o wide
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Fixes Applied Successfully!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Access your application at:"
    Write-Host "  Frontend: http://<NODE_IP>:30000"
    Write-Host "  Backend:  http://<NODE_IP>:30001"
    Write-Host ""
    Write-Host "Test backend health:"
    Write-Host "  curl http://<NODE_IP>:30001/health"
    Write-Host ""
    
} elseif (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    Write-Host "✓ Docker Compose found - Docker environment detected" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "1. Rebuilding and restarting containers..." -ForegroundColor Yellow
    docker-compose down
    docker-compose up -d --build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Containers restarted successfully" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed to restart containers" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "2. Checking container status..." -ForegroundColor Yellow
    docker-compose ps
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Fixes Applied Successfully!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Access your application at:"
    Write-Host "  Frontend: http://localhost"
    Write-Host "  Backend:  http://localhost:30001"
    Write-Host ""
    Write-Host "Test backend health:"
    Write-Host "  curl http://localhost:30001/health"
    Write-Host ""
    
} else {
    Write-Host "⚠ No Kubernetes or Docker found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "For local development:"
    Write-Host "1. Make sure config.js exists in frontend/js/"
    Write-Host "2. Start backend: cd backend && npm start"
    Write-Host "3. Open frontend/index.html in browser"
    Write-Host ""
    Write-Host "The config.js file has been created with localhost:3000 as default"
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "1. Open browser and navigate to your frontend URL"
Write-Host "2. Open browser console (F12)"
Write-Host "3. Check that API_BASE_URL is correct"
Write-Host "4. Try to login or signup"
Write-Host "5. Check browser Network tab for API requests"
Write-Host ""
Write-Host "If you still see errors, check:"
Write-Host "  - Backend logs: kubectl logs deployment/backend -n grocery-store"
Write-Host "  - Frontend logs: kubectl logs deployment/frontend -n grocery-store"
Write-Host "  - Browser console for JavaScript errors"
Write-Host ""
