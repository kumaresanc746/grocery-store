// Load admin products
async function loadAdminProducts() {
    try {
        const { data } = await adminApiRequest('/admin/products');
        const tableBody = document.getElementById('admin-products-table');
        
        if (data.products && data.products.length > 0) {
            tableBody.innerHTML = data.products.map(product => `
                <tr>
                    <td><img src="${product.image || 'https://via.placeholder.com/80'}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/80'"></td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>₹${product.price}</td>
                    <td>${product.stock}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-secondary" onclick="editProduct('${product._id}')">Edit</button>
                            <button class="btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="6">No products found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
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

// Logout admin
function logoutAdmin() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    window.location.href = 'admin-login.html';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        closeProductModal();
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadAdminProducts();
});


