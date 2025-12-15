const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Admin Schema
const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    createdAt: Date
});

const Admin = mongoose.model('Admin', adminSchema);

async function initializeAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@grocerystore.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@grocerystore.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const admin = new Admin({
            name: 'Admin User',
            email: 'admin@grocerystore.com',
            password: hashedPassword,
            createdAt: new Date()
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@grocerystore.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

initializeAdmin();
