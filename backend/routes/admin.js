const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { authAdmin } = require('../middleware/auth');

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// Get all products (admin)
router.get('/products', authAdmin, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single product (admin)
router.get('/products/:id', authAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add product
router.post('/products/add', authAdmin, async (req, res) => {
    try {
        const { name, category, price, stock, description, image } = req.body;

        if (!name || !category || !price || stock === undefined) {
            return res.status(400).json({ message: 'Name, category, price, and stock are required' });
        }

        const product = new Product({
            name,
            category,
            price,
            stock,
            description: description || '',
            image: image || 'https://via.placeholder.com/300'
        });

        await product.save();

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product
router.put('/products/:id', authAdmin, async (req, res) => {
    try {
        const { name, category, price, stock, description, image } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        if (name) product.name = name;
        if (category) product.category = category;
        if (price !== undefined) product.price = price;
        if (stock !== undefined) product.stock = stock;
        if (description !== undefined) product.description = description;
        if (image !== undefined) product.image = image;

        await product.save();

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product
router.delete('/products/:id', authAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users (admin)
router.get('/users', authAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get orders with delivery info (admin)
router.get('/orders', authAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email address')
            .populate('items.product', 'name image price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update order status or delivery details
router.put('/orders/:id', authAdmin, async (req, res) => {
    try {
        const { status, deliveryDetails } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (status) {
            if (!ORDER_STATUSES.includes(status)) {
                return res.status(400).json({ message: 'Invalid order status' });
            }
            order.status = status;
        }

        if (deliveryDetails) {
            if (!order.deliveryDetails) {
                order.deliveryDetails = {};
            }

            const { partner, trackingId, expectedDelivery, deliveryNotes } = deliveryDetails;

            if (partner !== undefined) order.deliveryDetails.partner = partner;
            if (trackingId !== undefined) order.deliveryDetails.trackingId = trackingId;
            if (deliveryNotes !== undefined) order.deliveryDetails.deliveryNotes = deliveryNotes;
            if (expectedDelivery !== undefined) {
                order.deliveryDetails.expectedDelivery = expectedDelivery
                    ? new Date(expectedDelivery)
                    : null;
            }

            order.deliveryDetails.lastUpdated = new Date();
        }

        await order.save();
        await order.populate('user', 'name email address');
        await order.populate('items.product', 'name image price');

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;


