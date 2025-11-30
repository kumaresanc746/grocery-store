// frontend/js/admin.js
// Improved admin UI logic + robust adminApiRequest wrapper

// --- Helper: API request wrapper (adds admin token, parses errors)
async function adminApiRequest(path, opts = {}) {
  const baseUrl = ''; // keep empty if same origin, or set to full API base like 'http://<YOUR-IP>:3000'
  const url = baseUrl + path;
  const token = localStorage.getItem('adminToken');

  const defaultHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  const fetchOpts = {
    method: opts.method || 'GET',
    headers: Object.assign({}, defaultHeaders, opts.headers || {}),
    body: opts.body || undefined
  };

  // Attach token if available
  if (token) {
    fetchOpts.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, fetchOpts);

    // If 401/403 — redirect to login
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      window.location.href = 'admin-login.html';
      return { success: false, status: res.status };
    }

    // Try to parse JSON
    const text = await res.text();
    let data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = (data && data.message) ? data.message : `Request failed (${res.status})`;
      throw new Error(msg);
    }

    return { success: true, status: res.status, data };
  } catch (err) {
    console.error('adminApiRequest error:', err);
    throw err;
  }
}

// --- Load admin products
async function loadAdminProducts() {
  try {
    const result = await adminApiRequest('/api/admin/products');
    const data = result.data || {};
    const tableBody = document.getElementById('admin-products-table');

    if (data.products && data.products.length > 0) {
      tableBody.innerHTML = data.products
        .map(
          (product) => `
        <tr>
          <td><img src="${escapeHtml(product.image || 'https://via.placeholder.com/80')}" 
                   alt="${escapeHtml(product.name)}"
                   onerror="this.src='https://via.placeholder.com/80'"></td>
          <td>${escapeHtml(product.name)}</td>
          <td>${escapeHtml(product.category)}</td>
          <td>₹${Number(product.price).toFixed(2)}</td>
          <td>${Number(product.stock)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-secondary" onclick="editProduct('${product._id}')">Edit</button>
              <button class="btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
            </div>
          </td>
        </tr>
      `
        )
        .join('');
    } else {
      tableBody.innerHTML = '<tr><td colspan="6">No products found</td></tr>';
    }
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Failed to load products.');
  }
}

// --- Show add product modal
function showAddProductModal() {
  document.getElementById('modal-title').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('product-modal').style.display = 'flex';
}

// --- Close modal
function closeProductModal() {
  document.getElementById('product-modal').style.display = 'none';
}

// --- Edit product
async function editProduct(productId) {
  try {
    const result = await adminApiRequest(`/api/admin/products/${productId}`);
    const product = result.data.product;

    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product._id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-image').value = product.image || '';

    document.getElementById('product-modal').style.display = 'flex';
  } catch (err) {
    console.error(err);
    alert('Failed to load product');
  }
}

// --- Delete product
async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const result = await adminApiRequest(`/api/admin/products/${productId}`, {
      method: 'DELETE'
    });

    if (result.data.success) {
      alert('Product deleted');
      loadAdminProducts();
    } else {
      alert('Failed to delete product');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to delete product');
  }
}

// --- Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// --- Submit product form
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const productId = document.getElementById('product-id').value;

  const productData = {
    name: document.getElementById('product-name').value.trim(),
    category: document.getElementById('product-category').value.trim(),
    price: parseFloat(document.getElementById('product-price').value),
    stock: parseInt(document.getElementById('product-stock').value),
    description: document.getElementById('product-description').value.trim(),
    image: document.getElementById('product-image').value.trim()
  };

  try {
    let result;

    if (productId) {
      // Update
      result = await adminApiRequest(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
    } else {
      // Add
      result = await adminApiRequest('/api/admin/products/add', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
    }

    if (result.data.success) {
      alert(productId ? 'Product updated' : 'Product added');
      closeProductModal();
      loadAdminProducts();
    } else {
      alert('Failed to save product');
    }
  } catch (err) {
    console.error(err);
    alert('Failed to save product');
  }
});

// --- Logout admin
function logoutAdmin() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
  window.location.href = 'admin-login.html';
}

// --- Close modal click outside
window.onclick = function (event) {
  const modal = document.getElementById('product-modal');
  if (event.target === modal) closeProductModal();
};

// --- Init
document.addEventListener('DOMContentLoaded', () => {
  loadAdminProducts();
});
