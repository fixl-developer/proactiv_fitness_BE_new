const bcrypt = require('bcryptjs');
const hash = '$2a$12$nf4x9HuOxygnp2xqhJRt4eP83YqPB9Ng4zeAnozCzTsVB7223u1Ae';
bcrypt.compare('Admin@123', hash).then(r => console.log('Admin@123 match:', r));
bcrypt.compare('admin123', hash).then(r => console.log('admin123 match:', r));
bcrypt.compare('Password123!', hash).then(r => console.log('Password123! match:', r));
