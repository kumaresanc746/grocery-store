
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authAdmin } = require('../middleware/auth');

// Get all products (admin)
router.get('/products', authAdmin, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get product by id
router.get('/products/:id', authAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ success: true, product });
    } catch (error) {
        console.error('Get product by id error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new product
router.post('/products/add', authAdmin, async (req, res) => {
    try {
        const { name, category, price, stock, description, image } = req.body;
        if (!name || !category || price == null) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const product = new Product({ name, category, price, stock: stock || 0, description: description || '', image: image || undefined });
        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product
router.put('/products/:id', authAdmin, async (req, res) => {
    try {
        const updates = req.body;
        const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ success: true, product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product
router.delete('/products/:id', authAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
