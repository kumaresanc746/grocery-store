#!/bin/bash

# Signup Server Error Diagnostic Script
# Run this on your Ubuntu server to diagnose the signup issue

echo "========================================="
echo "Grocery Store - Signup Error Diagnostics"
echo "========================================="
echo ""

echo "1. Checking Backend Pod Status..."
echo "-----------------------------------"
kubectl get pods -n grocery-store | grep backend
echo ""

echo "2. Checking Backend Logs (Last 50 lines)..."
echo "-----------------------------------"
kubectl logs deployment/backend -n grocery-store --tail=50
echo ""

echo "3. Checking MongoDB Pod Status..."
echo "-----------------------------------"
kubectl get pods -n grocery-store | grep mongo
echo ""

echo "4. Checking MongoDB Logs (Last 30 lines)..."
echo "-----------------------------------"
kubectl logs deployment/mongo -n grocery-store --tail=30
echo ""

echo "5. Testing Backend Health Endpoint..."
echo "-----------------------------------"
curl -v http://localhost:30001/health
echo ""

echo "6. Testing MongoDB Connection from Backend Pod..."
echo "-----------------------------------"
BACKEND_POD=$(kubectl get pods -n grocery-store -l app=backend -o jsonpath='{.items[0].metadata.name}')
echo "Backend Pod: $BACKEND_POD"
kubectl exec -n grocery-store $BACKEND_POD -- sh -c "nc -zv mongo 27017" 2>&1
echo ""

echo "7. Checking if Admin User Exists in MongoDB..."
echo "-----------------------------------"
MONGO_POD=$(kubectl get pods -n grocery-store -l app=mongo -o jsonpath='{.items[0].metadata.name}')
echo "Mongo Pod: $MONGO_POD"
kubectl exec -n grocery-store $MONGO_POD -- mongosh grocery-store --quiet --eval "db.admins.countDocuments()"
echo ""

echo "8. Testing Signup API Endpoint..."
echo "-----------------------------------"
curl -X POST http://localhost:30001/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "address": "123 Test St"
  }' \
  -v
echo ""

echo "========================================="
echo "Diagnostic Complete"
echo "========================================="
echo ""
echo "Common Issues to Check:"
echo "1. MongoDB not connected - Check backend logs for 'MongoDB Connected'"
echo "2. Missing environment variables - Check MONGODB_URI in backend pod"
echo "3. Database initialization - Check if collections exist"
echo "4. CORS errors - Check if frontend can reach backend"
echo ""
echo "Next Steps:"
echo "- Review the logs above for error messages"
echo "- Check if MongoDB connection is successful"
echo "- Verify backend can reach MongoDB on port 27017"
echo ""
