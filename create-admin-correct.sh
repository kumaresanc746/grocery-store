#!/bin/bash

# Quick Admin Creation Script
# This creates admin user directly using Node.js bcrypt to ensure correct password hash

echo "=== Creating Admin User with Correct Password Hash ==="
echo ""

cd ~/grocery-store

# Get MongoDB pod
MONGO_POD=$(kubectl get pods -n grocery-store -l app=mongo -o jsonpath='{.items[0].metadata.name}')

if [ -z "$MONGO_POD" ]; then
    echo "❌ MongoDB pod not found!"
    exit 1
fi

echo "MongoDB Pod: $MONGO_POD"
echo ""

# Get backend pod to use bcrypt
BACKEND_POD=$(kubectl get pods -n grocery-store -l app=backend -o jsonpath='{.items[0].metadata.name}')

echo "Backend Pod: $BACKEND_POD"
echo ""

# Create admin using backend's bcrypt
echo "Creating admin user..."
kubectl exec -n grocery-store $BACKEND_POD -- node -e "
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log('Password hash:', hash);
" > /tmp/admin_hash.txt

HASH=$(cat /tmp/admin_hash.txt | grep "Password hash:" | cut -d' ' -f3)

echo "Generated hash: $HASH"
echo ""

# Insert admin into MongoDB
kubectl exec -n grocery-store $MONGO_POD -- mongosh grocery-store --eval "
db.admins.deleteMany({email: 'admin@grocerystore.com'});
db.admins.insertOne({
  name: 'Admin',
  email: 'admin@grocerystore.com',
  password: '$HASH',
  createdAt: new Date()
});
print('Admin created successfully!');
"

echo ""
echo "=== Testing Admin Login ==="
curl -X POST http://localhost:30001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@grocerystore.com",
    "password": "admin123"
  }' | jq .

echo ""
echo "=== Done! ==="
echo "Admin Credentials:"
echo "  Email: admin@grocerystore.com"
echo "  Password: admin123"
echo ""
