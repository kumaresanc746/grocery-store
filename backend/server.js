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
const mongodbUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/grocery-store';
console.log(`Connecting to MongoDB at: ${mongodbUri}`);

mongoose.connect(mongodbUri)
    .then(async () => {
        console.log('✓ MongoDB Connected Successfully');

        // Seed Admin User
        try {
            const Admin = require('./models/Admin');
            const adminEmails = ['admin@grocerymart.com', 'admin@grocerystore.com'];

            for (const email of adminEmails) {
                let admin = await Admin.findOne({ email: email.toLowerCase() });

                if (!admin) {
                    console.log(`Creating default admin: ${email}`);
                    admin = new Admin({
                        name: 'Administrator',
                        email: email.toLowerCase(),
                        password: 'admin123'
                    });
                    await admin.save();
                    console.log(`✓ Admin user created successfully: ${email}`);
                } else {
                    console.log(`Verifying admin password for: ${email}`);
                    admin.password = 'admin123';
                    await admin.save();
                    console.log(`✓ Admin user password verified/updated for: ${email}`);
                }
            }
        } catch (error) {
            console.error('CRITICAL: Error during admin seeding:', error);
        }
    })
    .catch(err => {
        console.error('FATAL: MongoDB Connection Error:', err.message);
        console.error('Please ensure MongoDB is running and MONGODB_URI is correct.');
    });

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


