
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authUser, authAdmin } = require('../middleware/auth');

// Create order
router.post('/order/create', authUser, async (req, res) => {
    try {
        const { shippingAddress, phone, paymentMethod } = req.body;
        if (!shippingAddress || !phone) {
            return res.status(400).json({ message: 'Shipping address and phone are required' });
        }
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let total = 0;
        const items = cart.items.map(i => {
            const price = i.product.price || 0;
            total += price * i.quantity;
            return { product: i.product._id, quantity: i.quantity, price };
        });

        const order = new Order({
            user: req.user._id,
            items,
            shippingAddress,
            phone,
            paymentMethod: paymentMethod || 'cash',
            total
        });

        await order.save();

        // Clear cart
        cart.items = [];
        await cart.save();

        res.json({ success: true, order });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get order by id
router.get('/order/:id', authUser, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // allow admin or owner
        if (String(order.user) !== String(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update delivery/status (admin)
router.put('/order/:id/status', authAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Status is required' });
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        order.status = status;
        await order.save();
        res.json({ success: true, order });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get order history (user)
router.get('/order/history', authUser, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.product').sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get order history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
