// Frontend admin.js - communicates with backend routes implemented under /api/
//
// Expects admin JWT saved as localStorage.adminToken
// Uses same-origin API paths (relative) so you can host frontend on same domain / nginx.
//
// Functions:
// - loadProducts, add/edit/delete product
// - loadUsers
// - loadOrders, update order status
// - simple logs shown in #logs

const API_BASE = ''; // same origin; change to full URL if needed, e.g. 'http://EC2_IP:3000'

function log(msg) {
  const el = document.getElementById('logs');
  const p = document.createElement('div');
  p.textContent = (new Date()).toLocaleString() + ' — ' + msg;
  el.prepend(p);
}

// -------------------- Auth helpers --------------------
function getAdminHeaders(extra={}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  const token = localStorage.getItem('adminToken');
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return headers;
}

function logoutAdmin() {
  localStorage.removeItem('adminToken');
  window.location.href = 'admin-login.html';
}

// -------------------- Products --------------------
async function loadProducts() {
  try {
    const res = await fetch(API_BASE + '/api/admin/products', {
      headers: getAdminHeaders()
    });
    const data = await res.json();
    const box = document.getElementById('productList');
    box.innerHTML = '';
    if (!data.success) {
      box.innerHTML = '<p>Error loading products</p>';
      log('Failed to load products');
      return;
    }

    if (data.products.length === 0) {
      box.innerHTML = '<p>No products yet.</p>';
      return;
    }

    data.products.forEach(p => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div class="flex" style="justify-content:space-between;">
          <div style="flex:1">
            <strong>${escapeHtml(p.name)}</strong><br/>
            <small>${escapeHtml(p.category)}</small><br/>
            ₹${p.price} · stock: ${p.stock}
          </div>
          <div style="min-width:140px;text-align:right">
            <button class="btn" onclick="prefillEdit('${p._id}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteProduct('${p._id}')">Delete</button>
          </div>
        </div>`;
      box.appendChild(div);
    });
    log('Products loaded');
  } catch (e) {
    console.error(e);
    log('Error loading products: ' + e.message);
  }
}

function showAddForm() {
  document.getElementById('addProductCard').style.display = 'block';
  document.getElementById('formTitle').textContent = 'Add Product';
  document.getElementById('productId').value = '';
  document.getElementById('addForm').reset();
}

function hideAddForm() {
  document.getElementById('addProductCard').style.display = 'none';
}

async function prefillEdit(id) {
  try {
    const res = await fetch(API_BASE + '/api/admin/products/' + id, {
      headers: getAdminHeaders()
    });
    const data = await res.json();
    if (!data.success) {
      alert('Failed to load product');
      return;
    }
    const p = data.product;
    document.getElementById('productId').value = p._id;
    document.getElementById('pName').value = p.name || '';
    document.getElementById('pCategory').value = p.category || '';
    document.getElementById('pPrice').value = p.price || 0;
    document.getElementById('pStock').value = p.stock || 0;
    document.getElementById('pDesc').value = p.description || '';
    document.getElementById('pImage').value = p.image || '';
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('addProductCard').style.display = 'block';
  } catch (e) {
    console.error(e);
    alert('Error fetching product');
  }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    const res = await fetch(API_BASE + '/api/admin/products/' + id, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    const data = await res.json();
    if (data.success) {
      log('Product deleted: ' + id);
      loadProducts();
    } else {
      alert('Delete failed');
    }
  } catch (e) {
    console.error(e);
    alert('Delete failed');
  }
}

document.getElementById('addForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const id = document.getElementById('productId').value;
  const payload = {
    name: document.getElementById('pName').value,
    category: document.getElementById('pCategory').value,
    price: parseFloat(document.getElementById('pPrice').value) || 0,
    stock: parseInt(document.getElementById('pStock').value) || 0,
    description: document.getElementById('pDesc').value,
    image: document.getElementById('pImage').value
  };

  try {
    let res;
    if (id) {
      res = await fetch(API_BASE + '/api/admin/products/' + id, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(API_BASE + '/api/admin/products/add', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });
    }
    const data = await res.json();
    if (data.success) {
      hideAddForm();
      loadProducts();
      log(id ? 'Product updated: ' + data.product._id : 'Product added: ' + data.product._id);
    } else {
      alert('Save failed');
    }
  } catch (e) {
    console.error(e);
    alert('Save failed');
  }
});

// -------------------- Users --------------------
async function loadUsers() {
  try {
    const res = await fetch(API_BASE + '/api/admin/users', {
      headers: getAdminHeaders()
    });
    const data = await res.json();
    const box = document.getElementById('userList');
    box.innerHTML = '';
    if (!data.success) {
      box.innerHTML = '<p>Error loading users</p>';
      return;
    }
    if (data.users.length === 0) {
      box.innerHTML = '<p>No users found.</p>';
      return;
    }
    data.users.forEach(u => {
      const d = document.createElement('div');
      d.className = 'list-item';
      d.innerHTML = `<strong>${escapeHtml(u.name || '—')}</strong><br/><small>${escapeHtml(u.email || '')}</small>`;
      box.appendChild(d);
    });
    log('Users loaded');
  } catch (e) {
    console.error(e);
    log('Error loading users: ' + e.message);
  }
}

// -------------------- Orders --------------------
async function loadOrders() {
  try {
    const res = await fetch(API_BASE + '/api/order/all', {
      headers: getAdminHeaders()
    });
    const data = await res.json();
    const box = document.getElementById('orderList');
    box.innerHTML = '';
    if (!data.success) {
      box.innerHTML = '<p>Error loading orders</p>';
      return;
    }
    if (data.orders.length === 0) {
      box.innerHTML = '<p>No orders yet.</p>';
      return;
    }
    data.orders.forEach(o => {
      const d = document.createElement('div');
      d.className = 'list-item';
      const productsHtml = (o.items || []).map(i => {
        const name = i.product && i.product.name ? escapeHtml(i.product.name) : 'Item';
        return `<div>${name} × ${i.quantity} — ₹${i.price}</div>`;
      }).join('');
      d.innerHTML = `
        <div style="display:flex;justify-content:space-between;">
          <div style="flex:1">
            <strong>Order ${escapeHtml(o.orderNumber || o._id)}</strong><br/>
            <small>User: ${escapeHtml(o.user?.name || '—')} · ${escapeHtml(o.user?.email || '')}</small><br/>
            <small>Status: <span id="status-${o._id}">${escapeHtml(o.status)}</span></small><br/>
            <div>${productsHtml}</div>
            <div><strong>Total: ₹${o.total}</strong></div>
          </div>
          <div style="min-width:160px;text-align:right">
            <select id="select-${o._id}">
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
            <div style="margin-top:8px;">
              <button class="btn btn-primary" onclick="updateOrderStatus('${o._id}')">Update</button>
            </div>
          </div>
        </div>
      `;
      box.appendChild(d);

      // set select to current status
      const sel = document.getElementById('select-' + o._id);
      if (sel) sel.value = o.status;
    });
    log('Orders loaded');
  } catch (e) {
    console.error(e);
    log('Error loading orders: ' + e.message);
  }
}

async function updateOrderStatus(orderId) {
  try {
    const sel = document.getElementById('select-' + orderId);
    const status = sel.value;
    const res = await fetch(API_BASE + '/api/order/' + orderId + '/status', {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('status-' + orderId).textContent = status;
      log('Order ' + orderId + ' status updated to ' + status);
    } else {
      alert('Failed to update');
    }
  } catch (e) {
    console.error(e);
    alert('Failed to update');
  }
}

// -------------------- Utilities --------------------
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// -------------------- Init --------------------
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadUsers();
  loadOrders();
});
