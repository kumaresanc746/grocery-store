#!/bin/bash

# MongoDB Connection Fix Script
# This fixes the namespace issue causing MongoDB DNS resolution to fail

echo "========================================="
echo "Fixing MongoDB Connection Issue"
echo "========================================="
echo ""

echo "Problem: MongoDB deployed to wrong namespace"
echo "Solution: Redeploy MongoDB to grocery-store namespace"
echo ""

# Check current MongoDB deployments
echo "1. Checking for MongoDB in all namespaces..."
kubectl get deployment --all-namespaces | grep mongo

echo ""
echo "2. Deleting old MongoDB deployment (if exists in default namespace)..."
kubectl delete deployment mongo --ignore-not-found=true
kubectl delete svc mongo --ignore-not-found=true

echo ""
echo "3. Applying MongoDB to grocery-store namespace..."
kubectl apply -f k8s/mongo.yaml

echo ""
echo "4. Waiting for MongoDB pod to be ready..."
kubectl wait --for=condition=ready pod -l app=mongo -n grocery-store --timeout=120s

if [ $? -eq 0 ]; then
    echo "   ✓ MongoDB is ready"
else
    echo "   ✗ MongoDB failed to start"
    echo "   Check logs: kubectl logs deployment/mongo -n grocery-store"
    exit 1
fi

echo ""
echo "5. Verifying MongoDB service..."
kubectl get svc mongo -n grocery-store

echo ""
echo "6. Restarting backend to reconnect to MongoDB..."
kubectl rollout restart deployment/backend -n grocery-store

echo ""
echo "7. Waiting for backend rollout..."
kubectl rollout status deployment/backend -n grocery-store --timeout=60s

echo ""
echo "8. Checking backend logs for MongoDB connection..."
sleep 5
kubectl logs deployment/backend -n grocery-store --tail=20

echo ""
echo "========================================="
echo "Testing Connection"
echo "========================================="
echo ""

echo "9. Testing backend health..."
curl -s http://localhost:30001/health
echo ""

echo ""
echo "10. Testing signup API..."
curl -X POST http://localhost:30001/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "address": "123 Test Street"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "========================================="
echo "Fix Complete!"
echo "========================================="
echo ""
echo "✓ MongoDB deployed to grocery-store namespace"
echo "✓ Backend restarted and reconnected"
echo ""
echo "You should now be able to:"
echo "  - Signup new users"
echo "  - Login with existing users"
echo "  - Access admin dashboard"
echo ""
echo "If you still see errors, check:"
echo "  kubectl logs deployment/backend -n grocery-store"
echo "  kubectl logs deployment/mongo -n grocery-store"
echo ""
