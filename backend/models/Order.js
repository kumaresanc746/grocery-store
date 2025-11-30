
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: { type: String, default: 'cash' },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending','confirmed','shipped','delivered','cancelled'], default: 'pending' },
    orderNumber: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
