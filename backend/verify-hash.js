const bcrypt = require('bcryptjs');
const password = 'admin123';
const hashInInit = '$2a$10$rZ5c3qH8vK9mN2pL4xW6YeF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ';

async function verify() {
    const isMatch = await bcrypt.compare(password, hashInInit);
    console.log(`Password 'admin123' matches hash in mongo-init.js: ${isMatch}`);
    
    const newHash = await bcrypt.hash(password, 10);
    console.log(`Generated new hash for 'admin123': ${newHash}`);
}

verify();
