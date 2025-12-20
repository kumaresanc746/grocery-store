# Login and Admin Connection Error - Troubleshooting Guide

## 🔍 Common Issues Identified

### Issue 1: Missing `config.js` File
**Problem**: The frontend references `js/config.js` but this file doesn't exist in the project.

**Solution**: Create the `config.js` file manually.

---

## ✅ Solutions

### Solution 1: Create Missing `config.js` File

Create the file: `frontend/js/config.js`

```javascript
// API Configuration
// This will be overridden by ConfigMap in Kubernetes
window.BACKEND_URL = window.BACKEND_URL || 'http://localhost:3000/api';
```

**For Local Development:**
```javascript
window.BACKEND_URL = 'http://localhost:3000/api';
```

**For Docker Compose:**
```javascript
window.BACKEND_URL = 'http://localhost:30001/api';
```

**For Kubernetes:**
The ConfigMap will inject: `http://backend:3000/api` (internal cluster communication)

---

### Solution 2: Fix API URL Configuration

The issue is in `api.js` line 3:
```javascript
const API_BASE_URL = window.BACKEND_URL || `http://${window.location.hostname}:30001/api`;
```

**Current Behavior:**
- If `config.js` is missing, `window.BACKEND_URL` is undefined
- Falls back to `http://<hostname>:30001/api`

**For Kubernetes Deployment:**
You need to access via NodePort or LoadBalancer, not internal service name from browser.

---

### Solution 3: Check Backend Service Accessibility

**Verify Backend is Running:**

```bash
# For Docker Compose
docker-compose ps
docker-compose logs backend

# For Kubernetes
kubectl get pods -n grocery-store
kubectl get svc -n grocery-store
kubectl logs -n grocery-store deployment/backend
```

**Test Backend Health:**

```bash
# Local
curl http://localhost:3000/health

# Kubernetes (from inside cluster)
kubectl exec -n grocery-store -it <frontend-pod> -- curl http://backend:3000/health

# Kubernetes (from outside via NodePort)
curl http://<node-ip>:30001/health
```

---

### Solution 4: CORS Configuration

**Check if CORS is properly configured in backend:**

File: `backend/server.js` (Line 10)
```javascript
app.use(cors());
```

**For production, configure specific origins:**
```javascript
app.use(cors({
  origin: ['http://localhost', 'http://localhost:3000', 'http://your-domain.com'],
  credentials: true
}));
```

---

### Solution 5: Verify MongoDB Connection

**Check MongoDB is accessible:**

```bash
# Docker Compose
docker-compose logs mongo

# Kubernetes
kubectl get pods -n grocery-store | grep mongo
kubectl logs -n grocery-store deployment/mongo
```

**Test MongoDB Connection from Backend:**

```bash
# Kubernetes
kubectl exec -n grocery-store -it <backend-pod> -- sh
# Inside pod:
nc -zv mongo 27017
```

---

### Solution 6: Check Admin User Exists

**Verify admin user is created in MongoDB:**

```bash
# Docker Compose
docker exec -it <mongo-container> mongosh grocery-store
db.admins.find()

# Kubernetes
kubectl exec -n grocery-store -it <mongo-pod> -- mongosh grocery-store
db.admins.find()
```

**If no admin exists, create one:**

See the initialization script or create manually:
- Email: `admin@grocerystore.com`
- Password: `admin123` (hashed)

---

## 🛠️ Step-by-Step Fix

### For Local Development:

1. **Create `config.js`:**
```bash
cd frontend/js
cat > config.js << 'EOF'
window.BACKEND_URL = 'http://localhost:3000/api';
EOF
```

2. **Start Backend:**
```bash
cd backend
npm install
npm start
```

3. **Serve Frontend:**
```bash
cd frontend
python -m http.server 8000
# Or use any static server
```

4. **Test:**
- Open: http://localhost:8000
- Try login/signup

---

### For Docker Compose:

1. **Create `config.js`:**
```bash
cd frontend/js
cat > config.js << 'EOF'
window.BACKEND_URL = 'http://localhost:30001/api';
EOF
```

2. **Rebuild and Start:**
```bash
docker-compose down
docker-compose up -d --build
```

3. **Check Logs:**
```bash
docker-compose logs -f backend
```

4. **Test:**
- Open: http://localhost
- Check browser console for errors

---

### For Kubernetes:

1. **Verify ConfigMap:**
```bash
kubectl get configmap -n grocery-store frontend-config -o yaml
```

Should show:
```yaml
data:
  config.js: |
    window.BACKEND_URL = 'http://backend:3000/api';
```

**⚠️ ISSUE**: This won't work from browser! Browser can't access internal Kubernetes service names.

2. **Fix ConfigMap for External Access:**

Edit `k8s/frontend-configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
  namespace: grocery-store
data:
  config.js: |
    // Use NodePort for external access
    window.BACKEND_URL = window.location.protocol + '//' + window.location.hostname + ':30001/api';
```

3. **Apply Updated ConfigMap:**
```bash
kubectl apply -f k8s/frontend-configmap.yaml
kubectl rollout restart deployment/frontend -n grocery-store
```

4. **Get Node IP:**
```bash
kubectl get nodes -o wide
```

5. **Access Application:**
```
http://<NODE_IP>:30000  # Frontend
http://<NODE_IP>:30001/health  # Backend health check
```

---

## 🔧 Quick Fixes

### Fix 1: Create `config.js` File

```bash
mkdir -p frontend/js
cat > frontend/js/config.js << 'EOF'
// API Configuration
window.BACKEND_URL = window.BACKEND_URL || 'http://localhost:3000/api';
EOF
```

### Fix 2: Update Frontend ConfigMap (Kubernetes)

```bash
kubectl delete configmap frontend-config -n grocery-store
kubectl create configmap frontend-config -n grocery-store \
  --from-literal=config.js="window.BACKEND_URL = window.location.protocol + '//' + window.location.hostname + ':30001/api';"
kubectl rollout restart deployment/frontend -n grocery-store
```

### Fix 3: Check All Services

```bash
# Kubernetes
kubectl get all -n grocery-store

# Docker Compose
docker-compose ps
```

---

## 🧪 Testing

### Test Backend API:

```bash
# Health Check
curl http://localhost:30001/health

# Test Login (create user first via signup)
curl -X POST http://localhost:30001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test Admin Login
curl -X POST http://localhost:30001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@grocerystore.com","password":"admin123"}'
```

### Browser Console Testing:

Open browser console (F12) and run:

```javascript
// Check API URL
console.log('API URL:', API_BASE_URL);

// Test fetch
fetch(API_BASE_URL.replace('/api', '/health'))
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 🐛 Common Error Messages

### "Connection error"
- **Cause**: Backend not reachable
- **Fix**: Check backend is running, verify URL in `config.js`

### "Invalid credentials"
- **Cause**: User/admin doesn't exist or wrong password
- **Fix**: Create user via signup, verify admin exists in database

### "CORS error"
- **Cause**: CORS not configured properly
- **Fix**: Check backend CORS settings

### "Network request failed"
- **Cause**: Wrong API URL or backend not accessible
- **Fix**: Verify `window.BACKEND_URL` in browser console

---

## 📋 Checklist

- [ ] `config.js` file exists in `frontend/js/`
- [ ] Backend is running and accessible
- [ ] MongoDB is running and connected
- [ ] Admin user exists in database
- [ ] CORS is configured
- [ ] API URL is correct for your environment
- [ ] Browser console shows no errors
- [ ] Health endpoint returns `{"status":"OK"}`

---

## 🎯 Expected Behavior

**Successful Login:**
1. User enters credentials
2. Frontend sends POST to `/api/login`
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. User redirected to index.html

**Successful Admin Login:**
1. Admin enters credentials
2. Frontend sends POST to `/api/admin/login`
3. Backend validates and returns JWT token
4. Token stored in localStorage as `adminToken`
5. Admin redirected to admin-dashboard.html

---

## 💡 Pro Tips

1. **Always check browser console** for detailed error messages
2. **Use browser Network tab** to see actual API requests
3. **Test backend independently** before testing frontend
4. **Verify environment** (local/docker/kubernetes) and use correct URLs
5. **Check logs** for both frontend and backend containers

---

Need more help? Check:
- Backend logs: `docker-compose logs backend` or `kubectl logs deployment/backend`
- MongoDB logs: `docker-compose logs mongo` or `kubectl logs deployment/mongo`
- Browser console: F12 → Console tab
- Network requests: F12 → Network tab
