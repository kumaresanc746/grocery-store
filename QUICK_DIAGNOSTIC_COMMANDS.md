# Quick Commands to Run on Ubuntu Server

## 🔍 Step 1: Check Backend Logs (MOST IMPORTANT)

```bash
kubectl logs deployment/backend -n grocery-store --tail=100
```

**Look for:**
- ❌ "MongoDB Connection Error" 
- ❌ "ECONNREFUSED"
- ❌ Error messages about JWT, bcrypt, or missing modules
- ✅ "MongoDB Connected" (should see this)
- ✅ "Server running on port 3000" (should see this)

---

## 🔍 Step 2: Test Backend Health

```bash
curl http://localhost:30001/health
```

**Expected:** `{"status":"OK","message":"Server is running"}`

---

## 🔍 Step 3: Test Signup API Directly

```bash
curl -X POST http://localhost:30001/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "address": "123 Test Street"
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Success:** 
```json
{"success":true,"token":"...","user":{...}}
HTTP Status: 201
```

**If Error:** Will show the actual error message

---

## 🔍 Step 4: Check MongoDB Connection

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pods -n grocery-store -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Test MongoDB connection from backend pod
kubectl exec -n grocery-store $BACKEND_POD -- sh -c "nc -zv mongo 27017"
```

**Expected:** `mongo (10.x.x.x:27017) open`

---

## 🔍 Step 5: Check MongoDB is Running

```bash
kubectl get pods -n grocery-store | grep mongo
kubectl logs deployment/mongo -n grocery-store --tail=20
```

**Expected:** Pod should be "Running" and logs should show MongoDB started

---

## 🛠️ Quick Fixes to Try

### Fix 1: Restart Backend (if logs show old errors)

```bash
kubectl rollout restart deployment/backend -n grocery-store
kubectl rollout status deployment/backend -n grocery-store
# Wait for it to complete, then test signup again
```

### Fix 2: Add JWT_SECRET Environment Variable

```bash
# Edit backend deployment
kubectl edit deployment backend -n grocery-store

# Add this under env: section (if not already there)
# - name: JWT_SECRET
#   value: "your-secret-key-change-in-production-12345"

# Save and exit (ESC, then :wq in vi)
```

### Fix 3: Check MongoDB Data

```bash
MONGO_POD=$(kubectl get pods -n grocery-store -l app=mongo -o jsonpath='{.items[0].metadata.name}')

# Check if database exists
kubectl exec -n grocery-store $MONGO_POD -- mongosh --eval "show dbs"

# Check collections in grocery-store database
kubectl exec -n grocery-store $MONGO_POD -- mongosh grocery-store --eval "show collections"

# Check if any users exist
kubectl exec -n grocery-store $MONGO_POD -- mongosh grocery-store --eval "db.users.countDocuments()"
```

---

## 📋 Copy-Paste All-in-One Diagnostic

```bash
echo "=== BACKEND LOGS ==="
kubectl logs deployment/backend -n grocery-store --tail=50

echo -e "\n=== BACKEND HEALTH ==="
curl -s http://localhost:30001/health

echo -e "\n=== SIGNUP TEST ==="
curl -X POST http://localhost:30001/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","address":"123 St"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n=== MONGODB STATUS ==="
kubectl get pods -n grocery-store | grep mongo

echo -e "\n=== BACKEND ENV VARS ==="
BACKEND_POD=$(kubectl get pods -n grocery-store -l app=backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n grocery-store $BACKEND_POD -- env | grep -E "MONGODB_URI|PORT|JWT"
```

---

## 📤 Share Results

**After running the commands above, please share:**
1. The backend logs output
2. The signup test result
3. Any error messages you see

This will help me identify the exact issue and provide the right fix!
