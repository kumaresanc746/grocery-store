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

        // Seed Admin Users
        const adminEmails = ['admin@grocerymart.com', 'admin@grocerystore.com'];
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        for (const email of adminEmails) {
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                existingAdmin.password = hashedPassword;
                await existingAdmin.save();
                console.log(`✓ Admin user updated: ${email}`);
            } else {
                const admin = new Admin({
                    name: 'Admin User',
                    email: email,
                    password: hashedPassword,
                    createdAt: new Date()
                });
                await admin.save();
                console.log(`✓ Admin user created: ${email}`);
            }
        }

        console.log('\nFinal Admin Credentials:');
        console.log('Emails: admin@grocerymart.com OR admin@grocerystore.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

initializeAdmin();
