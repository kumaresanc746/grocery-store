const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Models (Imported for seeding)
const Admin = require('./models/Admin');

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/grocery-store')
    .then(async () => {
        console.log('MongoDB Connected');

        // Seed Admin User
        try {
            const adminExists = await Admin.findOne({ email: 'admin@grocerystore.com' });
            if (!adminExists) {
                await Admin.create({
                    name: 'Admin',
                    email: 'admin@grocerystore.com',
                    password: 'admin123'
                });
                console.log('✓ Default admin user created');
            } else {
                console.log('✓ Admin user already exists');
            }
        } catch (error) {
            console.error('Error seeding admin user:', error);
        }
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/products'));
app.use('/api', require('./routes/cart'));
app.use('/api', require('./routes/orders'));
app.use('/api', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


