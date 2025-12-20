# MongoDB Connection Fix - Quick Commands

## 🔍 Problem Identified

**Error**: `getaddrinfo EAI_AGAIN mongo`

**Meaning**: Backend cannot resolve the hostname "mongo" - DNS lookup is failing

**Likely Causes**:
1. MongoDB service not in the same namespace
2. MongoDB service doesn't exist
3. Service name mismatch

---

## ✅ Run These Commands on Ubuntu Server

### Step 1: Check if MongoDB Service Exists

```bash
kubectl get svc -n grocery-store
```

**Look for**: A service named `mongo` (not `mongodb` or anything else)

---

### Step 2: Check MongoDB Pod Status

```bash
kubectl get pods -n grocery-store | grep mongo
```

**Expected**: Pod should be "Running"

---

### Step 3: Check MongoDB Deployment

```bash
kubectl get deployment -n grocery-store | grep mongo
```

---

### Step 4: Test DNS Resolution from Backend Pod

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pods -n grocery-store -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Test DNS lookup
kubectl exec -n grocery-store $BACKEND_POD -- nslookup mongo

# Test connection
kubectl exec -n grocery-store $BACKEND_POD -- nc -zv mongo 27017
```

---

## 🛠️ Quick Fix

### If MongoDB service is missing or wrong namespace:

```bash
# Apply MongoDB deployment
kubectl apply -f k8s/mongo.yaml -n grocery-store

# Wait for pod to be ready
kubectl wait --for=condition=ready pod -l app=mongo -n grocery-store --timeout=60s

# Restart backend to reconnect
kubectl rollout restart deployment/backend -n grocery-store

# Check logs
kubectl logs deployment/backend -n grocery-store --tail=20
```

**Expected in logs**: `MongoDB Connected` ✅

---

### If service exists but backend still can't connect:

```bash
# Delete and recreate MongoDB service
kubectl delete svc mongo -n grocery-store
kubectl apply -f k8s/mongo.yaml -n grocery-store

# Restart backend
kubectl rollout restart deployment/backend -n grocery-store
```

---

## 📋 All-in-One Fix Script

```bash
cd ~/grocery-store

# Ensure MongoDB is deployed
kubectl apply -f k8s/mongo.yaml -n grocery-store

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongo -n grocery-store --timeout=120s

# Restart backend to reconnect
echo "Restarting backend..."
kubectl rollout restart deployment/backend -n grocery-store
kubectl rollout status deployment/backend -n grocery-store

# Check backend logs
echo "Checking backend logs..."
sleep 5
kubectl logs deployment/backend -n grocery-store --tail=30

# Test signup
echo "Testing signup..."
curl -X POST http://localhost:30001/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","address":"123 Test St"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

---

## ✅ Verification

After running the fix, check:

```bash
# Should see "MongoDB Connected"
kubectl logs deployment/backend -n grocery-store | grep "MongoDB Connected"

# Should return OK
curl http://localhost:30001/health

# Should create user successfully
curl -X POST http://localhost:30001/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test2@test.com","password":"pass123","address":"123 St"}'
```

**Success Response**:
```json
{"success":true,"token":"...","user":{...}}
```
