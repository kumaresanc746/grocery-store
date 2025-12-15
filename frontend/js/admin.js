const dashboardState = {
    products: [],
    users: [],
    orders: [],
    orderFilters: {
        search: '',
        status: 'all'
    }
};

let activeOrderId = null;

const STATUS_LABELS = {
    pending: 'pending',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled'
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
});

function formatCurrency(value) {
    if (typeof value !== 'number') return '₹0';
    return currencyFormatter.format(value);
}

function formatDate(value, includeTime = false) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const options = includeTime
        ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleString('en-IN', options);
}

function updateDashboardStats() {
    const productsCount = dashboardState.products.length;
    const usersCount = dashboardState.users.length;
    const pendingOrders = dashboardState.orders.filter(order => order.status === 'pending').length;

    const today = new Date();
    const deliveriesToday = dashboardState.orders.filter(order => {
        const expected = order.deliveryDetails?.expectedDelivery;
        if (!expected) return false;
        const date = new Date(expected);
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }).length;

    const lowStock = dashboardState.products.filter(product => product.stock !== undefined && product.stock <= 5).length;

    const productsEl = document.getElementById('stat-products-count');
    const usersEl = document.getElementById('stat-users-count');
    const pendingEl = document.getElementById('stat-pending-count');
    const todayEl = document.getElementById('stat-today-count');
    const lowStockEl = document.getElementById('stat-low-stock');

    if (productsEl) productsEl.textContent = productsCount;
    if (usersEl) usersEl.textContent = usersCount;
    if (pendingEl) pendingEl.textContent = pendingOrders;
    if (todayEl) todayEl.textContent = deliveriesToday;
    if (lowStockEl) lowStockEl.textContent = `${lowStock} low stock`;
}

// Load admin products
async function loadAdminProducts() {
    try {
        const { data } = await adminApiRequest('/admin/products');
        dashboardState.products = data.products || [];
        renderProductsTable();
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProductsTable() {
    const tableBody = document.getElementById('admin-products-table');
    if (!tableBody) return;

    if (!dashboardState.products.length) {
        tableBody.innerHTML = '<tr><td colspan="6">No products found</td></tr>';
        return;
    }

    tableBody.innerHTML = dashboardState.products.map(product => `
        <tr>
            <td><img src="${product.image || 'https://via.placeholder.com/80'}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/80'"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.stock ?? 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-secondary" onclick="editProduct('${product._id}')">Edit</button>
                    <button class="btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function loadAdminUsers() {
    try {
        const { data } = await adminApiRequest('/admin/users');
        dashboardState.users = data.users || [];
        renderUsersTable();
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function renderUsersTable() {
    const tableBody = document.getElementById('admin-users-table');
    if (!tableBody) return;

    if (!dashboardState.users.length) {
        tableBody.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
        return;
    }

    tableBody.innerHTML = dashboardState.users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.address}</td>
            <td>${formatDate(user.createdAt)}</td>
        </tr>
    `).join('');
}

async function loadAdminOrders() {
    try {
        const { data } = await adminApiRequest('/admin/orders');
        dashboardState.orders = (data.orders || []).map(order => ({
            ...order,
            deliveryDetails: order.deliveryDetails || {}
        }));
        renderOrdersTable();
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function getFilteredOrders() {
    const { search, status } = dashboardState.orderFilters;
    return dashboardState.orders.filter(order => {
        const matchesStatus = status === 'all' || order.status === status;
        if (!matchesStatus) return false;

        if (!search) return true;

        const haystack = [
            order.orderNumber,
            order.user?.name,
            order.user?.email,
            order.deliveryDetails?.trackingId
        ].join(' ').toLowerCase();

        return haystack.includes(search.toLowerCase());
    });
}

function renderOrdersTable() {
    const tableBody = document.getElementById('admin-orders-table');
    if (!tableBody) return;

    const orders = getFilteredOrders();

    if (!orders.length) {
        tableBody.innerHTML = '<tr><td colspan="7">No orders found</td></tr>';
        return;
    }

    tableBody.innerHTML = orders.map(order => {
        const statusLabel = STATUS_LABELS[order.status] || order.status;
        const delivery = order.deliveryDetails || {};
        const expectedDelivery = formatDate(delivery.expectedDelivery);
        const updatedAt = delivery.lastUpdated ? formatDate(delivery.lastUpdated, true) : formatDate(order.createdAt, true);
        const customerName = order.user?.name || 'Unknown customer';
        const customerEmail = order.user?.email || '—';

        return `
            <tr>
                <td>${order.orderNumber}</td>
                <td>
                    <div class="customer-cell">
                        <strong>${customerName}</strong>
                        <p>${customerEmail}</p>
                    </div>
                </td>
                <td>${formatCurrency(order.totalAmount)}</td>
                <td><span class="status-badge ${order.status}">${statusLabel}</span></td>
                <td>${expectedDelivery}</td>
                <td>${updatedAt}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-secondary" onclick="openOrderModal('${order._id}')">Manage</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Show add product modal
function showAddProductModal() {
    document.getElementById('modal-title').textContent = 'Add Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal').style.display = 'flex';
}

// Close product modal
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Edit product
async function editProduct(productId) {
    try {
        const { data } = await adminApiRequest(`/admin/products/${productId}`);
        
        if (data.product) {
            const product = data.product;
            document.getElementById('modal-title').textContent = 'Edit Product';
            document.getElementById('product-id').value = product._id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-description').value = product.description || '';
            document.getElementById('product-image').value = product.image || '';
            document.getElementById('product-modal').style.display = 'flex';
        }
    } catch (error) {
        alert('Failed to load product');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const { data } = await adminApiRequest(`/admin/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            alert('Product deleted successfully');
            loadAdminProducts();
        }
    } catch (error) {
        alert('Failed to delete product');
    }
}

// Handle product form submission
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        description: document.getElementById('product-description').value,
        image: document.getElementById('product-image').value
    };
    
    try {
        let data;
        if (productId) {
            // Update product
            const result = await adminApiRequest(`/admin/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            data = result.data;
        } else {
            // Add product
            const result = await adminApiRequest('/admin/products/add', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            data = result.data;
        }
        
        if (data.success) {
            alert(productId ? 'Product updated successfully' : 'Product added successfully');
            closeProductModal();
            loadAdminProducts();
        }
    } catch (error) {
        alert('Failed to save product');
    }
});

function openOrderModal(orderId) {
    const order = dashboardState.orders.find(item => item._id === orderId);
    if (!order) return;

    activeOrderId = orderId;
    document.getElementById('order-modal-number').textContent = `${order.orderNumber} • ${order.user?.name || 'Customer'}`;
    document.getElementById('order-status-select').value = order.status;
    document.getElementById('delivery-partner').value = order.deliveryDetails?.partner || '';
    document.getElementById('delivery-tracking').value = order.deliveryDetails?.trackingId || '';
    document.getElementById('delivery-notes').value = order.deliveryDetails?.deliveryNotes || '';

    const expectedDate = order.deliveryDetails?.expectedDelivery
        ? new Date(order.deliveryDetails.expectedDelivery).toISOString().split('T')[0]
        : '';
    document.getElementById('delivery-date').value = expectedDate;

    document.getElementById('order-modal').style.display = 'flex';
}

function closeOrderModal() {
    activeOrderId = null;
    document.getElementById('order-form').reset();
    document.getElementById('order-modal').style.display = 'none';
}

document.getElementById('order-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeOrderId) return;

    const payload = {
        status: document.getElementById('order-status-select').value,
        deliveryDetails: {
            partner: document.getElementById('delivery-partner').value.trim(),
            trackingId: document.getElementById('delivery-tracking').value.trim(),
            deliveryNotes: document.getElementById('delivery-notes').value.trim()
        }
    };

    const expectedDate = document.getElementById('delivery-date').value;
    if (expectedDate) {
        payload.deliveryDetails.expectedDelivery = expectedDate;
    }

    try {
        const { data } = await adminApiRequest(`/admin/orders/${activeOrderId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        if (data.success) {
            alert('Order updated successfully');
            closeOrderModal();
            loadAdminOrders();
        } else {
            alert('Failed to update order');
        }
    } catch (error) {
        alert('Failed to update order');
    }
});

function initDashboardTabs() {
    const buttons = document.querySelectorAll('.dashboard-tabs .tab-button');
    const panels = document.querySelectorAll('.tab-panel');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            const targetPanel = document.getElementById(`tab-${button.dataset.tab}`);
            targetPanel?.classList.add('active');
        });
    });
}

function initOrderFilters() {
    const searchInput = document.getElementById('order-search');
    const statusSelect = document.getElementById('order-status-filter');

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            dashboardState.orderFilters.search = event.target.value.trim().toLowerCase();
            renderOrdersTable();
        });
    }

    if (statusSelect) {
        statusSelect.addEventListener('change', (event) => {
            dashboardState.orderFilters.status = event.target.value;
            renderOrdersTable();
        });
    }
}

// Logout admin
function logoutAdmin() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = 'admin-login.html';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const productModal = document.getElementById('product-modal');
    const orderModal = document.getElementById('order-modal');

    if (event.target === productModal) {
        closeProductModal();
    }

    if (event.target === orderModal) {
        closeOrderModal();
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initDashboardTabs();
    initOrderFilters();
    loadAdminProducts();
    loadAdminUsers();
    loadAdminOrders();
});
