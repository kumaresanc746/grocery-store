const mongoose = require('mongoose');
require('dotenv').config();

// Admin Schema
const adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    createdAt: Date
});

const Admin = mongoose.model('Admin', adminSchema);

async function deleteAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete the admin user
        const result = await Admin.deleteOne({ email: 'admin@grocerystore.com' });

        if (result.deletedCount > 0) {
            console.log('✅ Admin user deleted successfully!');
        } else {
            console.log('❌ Admin user not found in database');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

deleteAdmin();
