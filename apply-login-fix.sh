#!/bin/bash

# Login Fix Deployment Script
# This script applies the fixes for login and admin connection errors

echo "========================================="
echo "Applying Login Connection Fixes"
echo "========================================="
echo ""

# Check if running in Kubernetes environment
if command -v kubectl &> /dev/null; then
    echo "✓ kubectl found - Kubernetes environment detected"
    echo ""
    
    # Apply updated ConfigMap
    echo "1. Applying updated frontend ConfigMap..."
    kubectl apply -f k8s/frontend-configmap.yaml
    
    if [ $? -eq 0 ]; then
        echo "   ✓ ConfigMap applied successfully"
    else
        echo "   ✗ Failed to apply ConfigMap"
        exit 1
    fi
    
    echo ""
    echo "2. Restarting frontend deployment to pick up new config..."
    kubectl rollout restart deployment/frontend -n grocery-store
    
    if [ $? -eq 0 ]; then
        echo "   ✓ Frontend deployment restarted"
    else
        echo "   ✗ Failed to restart frontend"
        exit 1
    fi
    
    echo ""
    echo "3. Waiting for rollout to complete..."
    kubectl rollout status deployment/frontend -n grocery-store --timeout=60s
    
    echo ""
    echo "4. Getting service information..."
    kubectl get svc -n grocery-store
    
    echo ""
    echo "5. Getting node IP addresses..."
    kubectl get nodes -o wide
    
    echo ""
    echo "========================================="
    echo "Fixes Applied Successfully!"
    echo "========================================="
    echo ""
    echo "Access your application at:"
    echo "  Frontend: http://<NODE_IP>:30000"
    echo "  Backend:  http://<NODE_IP>:30001"
    echo ""
    echo "Test backend health:"
    echo "  curl http://<NODE_IP>:30001/health"
    echo ""
    
elif command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    echo "✓ Docker found - Docker Compose environment detected"
    echo ""
    
    echo "1. Rebuilding and restarting containers..."
    docker-compose down
    docker-compose up -d --build
    
    if [ $? -eq 0 ]; then
        echo "   ✓ Containers restarted successfully"
    else
        echo "   ✗ Failed to restart containers"
        exit 1
    fi
    
    echo ""
    echo "2. Checking container status..."
    docker-compose ps
    
    echo ""
    echo "========================================="
    echo "Fixes Applied Successfully!"
    echo "========================================="
    echo ""
    echo "Access your application at:"
    echo "  Frontend: http://localhost"
    echo "  Backend:  http://localhost:30001"
    echo ""
    echo "Test backend health:"
    echo "  curl http://localhost:30001/health"
    echo ""
    
else
    echo "⚠ No Kubernetes or Docker found"
    echo ""
    echo "For local development:"
    echo "1. Make sure config.js exists in frontend/js/"
    echo "2. Start backend: cd backend && npm start"
    echo "3. Open frontend/index.html in browser"
    echo ""
    echo "The config.js file has been created with localhost:3000 as default"
    echo ""
fi

echo "========================================="
echo "Next Steps:"
echo "========================================="
echo "1. Open browser and navigate to your frontend URL"
echo "2. Open browser console (F12)"
echo "3. Check that API_BASE_URL is correct"
echo "4. Try to login or signup"
echo "5. Check browser Network tab for API requests"
echo ""
echo "If you still see errors, check:"
echo "  - Backend logs: kubectl logs deployment/backend -n grocery-store"
echo "  - Frontend logs: kubectl logs deployment/frontend -n grocery-store"
echo "  - Browser console for JavaScript errors"
echo ""
