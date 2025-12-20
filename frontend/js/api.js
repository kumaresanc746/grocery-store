// API Configuration: Smart detection for Ingress vs direct NodePort access
const getApiBaseUrl = () => {
    // If we have a manually set BACKEND_URL in config.js (from ConfigMap), use it
    if (window.BACKEND_URL && !window.BACKEND_URL.includes('31581')) {
        return window.BACKEND_URL;
    }

    const { hostname, port, protocol } = window.location;

    // Detect if we are accessing via the Frontend NodePort
    if (port === '31581') {
        return `${protocol}//${hostname}:30001/api`;
    }

    // Default to Ingress-friendly relative path or standard host/api
    return `${protocol}//${window.location.host}/api`;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🚀 GroceryMart API Path:', API_BASE_URL);
// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

function getAdminToken() {
    return localStorage.getItem('adminToken');
}

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok && response.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('login')) {
                window.location.href = 'login.html';
            }
        }

        return { response, data };
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function adminApiRequest(endpoint, options = {}) {
    const token = getAdminToken();
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok && response.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('admin');
            window.location.href = 'admin-login.html';
        }

        return { response, data };
    } catch (error) {
        console.error('Admin API Error:', error);
        throw error;
    }
}


