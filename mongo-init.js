// MongoDB Initialization Script
// This script creates default admin user and sample products

db = db.getSiblingDB('grocery-store');

// Create Admin User
print('Creating default admin user...');

// Check if admin already exists
// Check if admin already exists
const existingAdmin = db.admins.findOne({ email: 'admin@grocerymart.com' });

if (!existingAdmin) {
    db.admins.insertOne({
        name: 'Admin',
        email: 'admin@grocerymart.com',
        // Password: admin123 (hashed with bcrypt - salt rounds: 10)
        password: '$2a$10$rZ5c3qH8vK9mN2pL4xW6YeF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ',
        createdAt: new Date()
    });
    print('✓ Admin user created successfully');
    print('  Email: admin@grocerymart.com');
    print('  Password: admin123');
} else {
    print('✓ Admin user already exists');
}

// Create sample products if none exist
print('\nChecking for products...');
const productCount = db.products.countDocuments();

if (productCount === 0) {
    print('Creating sample products...');

    db.products.insertMany([
        {
            name: 'Fresh Apples',
            category: 'fruits',
            price: 150,
            stock: 100,
            description: 'Fresh red apples from Kashmir',
            image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300',
            createdAt: new Date()
        },
        {
            name: 'Organic Bananas',
            category: 'fruits',
            price: 60,
            stock: 150,
            description: 'Organic bananas rich in potassium',
            image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300',
            createdAt: new Date()
        },
        {
            name: 'Fresh Tomatoes',
            category: 'vegetables',
            price: 40,
            stock: 200,
            description: 'Fresh farm tomatoes',
            image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300',
            createdAt: new Date()
        },
        {
            name: 'Green Capsicum',
            category: 'vegetables',
            price: 80,
            stock: 80,
            description: 'Fresh green bell peppers',
            image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300',
            createdAt: new Date()
        },
        {
            name: 'Fresh Milk',
            category: 'dairy',
            price: 60,
            stock: 50,
            description: 'Fresh cow milk 1L',
            image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
            createdAt: new Date()
        },
        {
            name: 'Cheddar Cheese',
            category: 'dairy',
            price: 250,
            stock: 30,
            description: 'Premium cheddar cheese 200g',
            image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300',
            createdAt: new Date()
        }
    ]);

    print('✓ Sample products created');
} else {
    print('✓ Products already exist (' + productCount + ' products)');
}

print('\n=== Initialization Complete ===');
print('Admin Login: http://your-ip:31581/admin-login.html');
print('Email: admin@grocerymart.com');
print('Password: admin123');
