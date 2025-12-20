#!/bin/bash

# Database Initialization Script
# Run this after deploying to create admin user and sample data

echo "========================================="
echo "Database Initialization"
echo "========================================="
echo ""

cd ~/grocery-store

MONGO_POD=$(kubectl get pods -n grocery-store -l app=mongo -o jsonpath='{.items[0].metadata.name}')

if [ -z "$MONGO_POD" ]; then
    echo "❌ MongoDB pod not found!"
    echo "Make sure MongoDB is running: kubectl get pods -n grocery-store"
    exit 1
fi

echo "MongoDB Pod: $MONGO_POD"
echo ""

# Copy initialization script to MongoDB pod
echo "1. Copying initialization script to MongoDB pod..."
kubectl cp mongo-init.js grocery-store/$MONGO_POD:/tmp/mongo-init.js

# Run initialization script
echo "2. Running initialization script..."
kubectl exec -n grocery-store $MONGO_POD -- mongosh grocery-store /tmp/mongo-init.js

echo ""
echo "========================================="
echo "Testing Admin Login"
echo "========================================="
echo ""

# Test admin login
RESPONSE=$(curl -s -X POST http://localhost:30001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@grocerystore.com",
    "password": "admin123"
  }')

echo "$RESPONSE" | jq .

if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo ""
    echo "✅ Admin login successful!"
else
    echo ""
    echo "❌ Admin login failed. Check the response above."
fi

echo ""
echo "========================================="
echo "Initialization Complete!"
echo "========================================="
echo ""
echo "Admin Credentials:"
echo "  Email: admin@grocerystore.com"
echo "  Password: admin123"
echo ""
EC2_IP=$(curl -s http://checkip.amazonaws.com)
echo "Admin Login URL: http://$EC2_IP:31581/admin-login.html"
echo ""
