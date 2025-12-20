#!/bin/bash

# Complete Frontend and Backend Fix Script
# This rebuilds the Docker images with correct configuration

echo "========================================="
echo "Complete Frontend & Backend Fix"
echo "========================================="
echo ""

cd ~/grocery-store

# Get EC2 IP
EC2_IP=$(curl -s http://checkip.amazonaws.com)
echo "EC2 IP: $EC2_IP"
echo ""

# Step 1: Create config.js in frontend
echo "1. Creating config.js in frontend..."
cat > frontend/js/config.js << 'EOF'
// API Configuration
window.BACKEND_URL = window.BACKEND_URL || 'http://localhost:3000/api';
EOF
echo "   ✓ Created frontend/js/config.js"
echo ""

# Step 2: Rebuild frontend Docker image
echo "2. Rebuilding frontend Docker image..."
cd frontend
docker build -t kumaresan05/grocery-frontend:latest .
docker push kumaresan05/grocery-frontend:latest
cd ..
echo "   ✓ Frontend image rebuilt and pushed"
echo ""

# Step 3: Update frontend ConfigMap
echo "3. Updating frontend ConfigMap..."
cat > k8s/frontend-configmap.yaml << 'EOF'
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
  namespace: grocery-store
data:
  config.js: |
    window.BACKEND_URL = window.location.protocol + '//' + window.location.hostname + ':30001/api';
EOF
kubectl apply -f k8s/frontend-configmap.yaml
echo "   ✓ ConfigMap updated"
echo ""

# Step 4: Restart frontend deployment
echo "4. Restarting frontend deployment..."
kubectl delete pod -n grocery-store -l app=frontend
kubectl wait --for=condition=ready pod -l app=frontend -n grocery-store --timeout=60s
echo "   ✓ Frontend restarted"
echo ""

# Step 5: Verify backend is running
echo "5. Checking backend status..."
kubectl get pods -n grocery-store -l app=backend
echo ""

# Step 6: Test everything
echo "6. Testing APIs..."
echo ""

echo "   Backend Health:"
curl -s http://localhost:30001/health | jq .
echo ""

echo "   Test Login:"
curl -s -X POST http://localhost:30001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"verify@test.com","password":"test123"}' | jq .
echo ""

# Step 7: Verify frontend config
echo "7. Verifying frontend configuration..."
FRONTEND_POD=$(kubectl get pods -n grocery-store -l app=frontend -o jsonpath='{.items[0].metadata.name}')
echo "   Frontend pod: $FRONTEND_POD"
echo "   Config.js content:"
kubectl exec -n grocery-store $FRONTEND_POD -- cat /usr/share/nginx/html/js/config.js
echo ""

echo "========================================="
echo "Fix Complete!"
echo "========================================="
echo ""
echo "Access your application:"
echo "  Frontend: http://$EC2_IP:31581"
echo "  Login: http://$EC2_IP:31581/login.html"
echo ""
echo "Test credentials:"
echo "  Email: verify@test.com"
echo "  Password: test123"
echo ""
echo "In browser:"
echo "  1. Open http://$EC2_IP:31581/login.html"
echo "  2. Clear cache (Ctrl+Shift+Delete)"
echo "  3. Hard refresh (Ctrl+Shift+R)"
echo "  4. Press F12 → Console"
echo "  5. Type: console.log(API_BASE_URL)"
echo "  6. Should show: http://$EC2_IP:30001/api"
echo ""
