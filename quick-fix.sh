# Complete Fix - Quick Version (No Docker Rebuild)
# This updates the ConfigMap and forces frontend to reload

cd ~/grocery-store

echo "=== Quick Fix (No Rebuild Required) ==="
echo ""

# Update ConfigMap
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

# Apply ConfigMap
kubectl apply -f k8s/frontend-configmap.yaml

# Force delete frontend pods
kubectl delete pod -n grocery-store -l app=frontend --force --grace-period=0

# Wait for new pod
echo "Waiting for frontend pod..."
sleep 15

# Verify
FRONTEND_POD=$(kubectl get pods -n grocery-store -l app=frontend -o jsonpath='{.items[0].metadata.name}')
echo ""
echo "New frontend pod: $FRONTEND_POD"
echo ""
echo "Config in pod:"
kubectl exec -n grocery-store $FRONTEND_POD -- cat /usr/share/nginx/html/js/config.js
echo ""
echo "=== Done! ==="
echo ""
EC2_IP=$(curl -s http://checkip.amazonaws.com)
echo "Access: http://$EC2_IP:31581/login.html"
echo ""
echo "In browser:"
echo "  1. Hard refresh (Ctrl+Shift+R)"
echo "  2. Clear cache"
echo "  3. Try login"
echo ""
