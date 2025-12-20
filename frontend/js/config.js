// API Configuration
// This configuration will be overridden by Kubernetes ConfigMap when deployed
// For local development, it uses localhost
// For production, it will be injected by the ConfigMap

window.BACKEND_URL = window.BACKEND_URL || 'http://localhost:3000/api';
