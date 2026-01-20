const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
    async create(email, password, name) {
        const hashedPassword = await bcrypt.hash(password, 12);
        const [result] = await db.query(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, name]
        );
        return result.insertId;
    },

    async findByEmail(email) {
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return users[0];
    },

    async findById(id) {
        const [users] = await db.query(
            'SELECT id, email, name, created_at FROM users WHERE id = ?',
            [id]
        );
        return users[0];
    },

    async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }
};

module.exports = User;
