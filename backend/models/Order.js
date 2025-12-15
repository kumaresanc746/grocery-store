const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const deliveryDetailsSchema = new mongoose.Schema({
    partner: {
        type: String,
        default: ''
    },
    trackingId: {
        type: String,
        default: ''
    },
    expectedDelivery: {
        type: Date
    },
    deliveryNotes: {
        type: String,
        default: ''
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'card'],
        default: 'cod'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryDetails: {
        type: deliveryDetailsSchema,
        default: () => ({
            partner: '',
            trackingId: '',
            expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            deliveryNotes: '',
            lastUpdated: new Date()
        })
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate order number before validation so required check passes
orderSchema.pre('validate', function(next) {
    if (!this.orderNumber) {
        this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);


