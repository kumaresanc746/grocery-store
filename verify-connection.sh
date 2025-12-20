#!/bin/bash

echo "=========================================="
echo "Grocery Store Connection Verification"
echo "=========================================="
echo ""

# Get Node IP
NODE_IP=$(hostname -I | awk '{print $1}')
echo "Node IP: $NODE_IP"
echo ""

# Check pod status
echo "1. Checking Pod Status..."
kubectl get pods -n grocery-store
echo ""

# Check ConfigMap
echo "2. Verifying ConfigMap exists..."
kubectl get configmap -n grocery-store frontend-config
echo ""

# Check if ConfigMap is mounted in frontend pod
echo "3. Checking ConfigMap mount in frontend pod..."
FRONTEND_POD=$(kubectl get pods -n grocery-store -l app=frontend -o jsonpath='{.items[0].metadata.name}')
echo "Frontend pod: $FRONTEND_POD"
kubectl exec -n grocery-store $FRONTEND_POD -- cat /usr/share/nginx/html/js/config.js 2>/dev/null || echo "⚠️  ConfigMap not mounted or path incorrect"
echo ""

# Check backend environment variables
echo "4. Checking Backend Environment Variables..."
BACKEND_POD=$(kubectl get pods -n grocery-store -l app=backend -o jsonpath='{.items[0].metadata.name}')
echo "Backend pod: $BACKEND_POD"
kubectl exec -n grocery-store $BACKEND_POD -- env | grep -E "MONGODB_URI|PORT"
echo ""

# Test backend health endpoint
echo "5. Testing Backend Health Endpoint..."
curl -s http://$NODE_IP:30001/health || echo "⚠️  Backend health check failed"
echo ""
echo ""

# Check backend logs for MongoDB connection
echo "6. Checking Backend Logs for MongoDB Connection..."
kubectl logs -n grocery-store $BACKEND_POD --tail=20 | grep -i mongo || echo "No MongoDB logs found"
echo ""

# Test frontend accessibility
echo "7. Testing Frontend Accessibility..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://$NODE_IP:31581
echo ""

echo "=========================================="
echo "Access URLs:"
echo "=========================================="
echo "Frontend:      http://$NODE_IP:31581"
echo "Backend API:   http://$NODE_IP:30001/api"
echo "Backend Health: http://$NODE_IP:30001/health"
echo "Mongo Express: http://$NODE_IP:32520"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Open frontend in browser: http://$NODE_IP:31581"
echo "2. Open browser console (F12) and check for API errors"
echo "3. Try to browse products or login"
echo ""
