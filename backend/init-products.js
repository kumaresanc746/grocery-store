const mongoose = require('mongoose');
require('dotenv').config();

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    stock: Number,
    description: String,
    image: String,
    createdAt: Date
});

const Product = mongoose.model('Product', productSchema);

async function initializeProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if products already exist
        const existingProducts = await Product.countDocuments();
        if (existingProducts > 0) {
            console.log(`Database already has ${existingProducts} products!`);
            process.exit(0);
        }

        // Sample products
        const products = [
            {
                name: 'Fresh Apples',
                category: 'fruits',
                price: 150,
                stock: 100,
                description: 'Fresh and crisp red apples',
                image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300',
                createdAt: new Date()
            },
            {
                name: 'Bananas',
                category: 'fruits',
                price: 60,
                stock: 150,
                description: 'Fresh yellow bananas',
                image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300',
                createdAt: new Date()
            },
            {
                name: 'Tomatoes',
                category: 'vegetables',
                price: 80,
                stock: 100,
                description: 'Fresh red tomatoes',
                image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300',
                createdAt: new Date()
            },
            {
                name: 'Carrots',
                category: 'vegetables',
                price: 50,
                stock: 120,
                description: 'Fresh organic carrots',
                image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300',
                createdAt: new Date()
            },
            {
                name: 'Milk',
                category: 'dairy',
                price: 60,
                stock: 100,
                description: 'Fresh whole milk 1L',
                image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300',
                createdAt: new Date()
            },
            {
                name: 'Cheese',
                category: 'dairy',
                price: 200,
                stock: 50,
                description: 'Premium cheddar cheese',
                image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300',
                createdAt: new Date()
            },
            {
                name: 'Potato Chips',
                category: 'snacks',
                price: 50,
                stock: 100,
                description: 'Crispy potato chips',
                image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300',
                createdAt: new Date()
            },
            {
                name: 'Cookies',
                category: 'snacks',
                price: 80,
                stock: 80,
                description: 'Chocolate chip cookies',
                image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300',
                createdAt: new Date()
            },
            {
                name: 'Cola',
                category: 'beverages',
                price: 45,
                stock: 100,
                description: 'Refreshing cola drink 500ml',
                image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300',
                createdAt: new Date()
            },
            {
                name: 'Orange Juice',
                category: 'beverages',
                price: 90,
                stock: 70,
                description: 'Fresh orange juice 1L',
                image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300',
                createdAt: new Date()
            },
            {
                name: 'Chicken Breast',
                category: 'meat',
                price: 350,
                stock: 50,
                description: 'Fresh chicken breast 500g',
                image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300',
                createdAt: new Date()
            },
            {
                name: 'Ground Beef',
                category: 'meat',
                price: 400,
                stock: 40,
                description: 'Fresh ground beef 500g',
                image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=300',
                createdAt: new Date()
            }
        ];

        await Product.insertMany(products);
        console.log(`✅ Successfully added ${products.length} products to the database!`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

initializeProducts();
