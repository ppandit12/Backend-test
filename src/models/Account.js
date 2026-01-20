const db = require('../config/database');

const Account = {
    async create(userId, type = 'free') {
        const [result] = await db.query(
            'INSERT INTO accounts (user_id, type) VALUES (?, ?)',
            [userId, type]
        );
        return result.insertId;
    },

    async findByUserId(userId) {
        const [accounts] = await db.query(
            'SELECT * FROM accounts WHERE user_id = ?',
            [userId]
        );
        return accounts[0];
    },

    async findById(id) {
        const [accounts] = await db.query(
            'SELECT * FROM accounts WHERE id = ?',
            [id]
        );
        return accounts[0];
    },

    async upgrade(accountId) {
        await db.query(
            'UPDATE accounts SET type = ? WHERE id = ?',
            ['premium', accountId]
        );
    },

    async isPremium(accountId) {
        const [accounts] = await db.query(
            'SELECT type FROM accounts WHERE id = ?',
            [accountId]
        );
        return accounts[0]?.type === 'premium';
    }
};

module.exports = Account;
