const db = require('../config/database');

const Board = {
    async create(accountId, name, description = null) {
        // Get max position
        const [maxPos] = await db.query(
            'SELECT COALESCE(MAX(position), -1) + 1 as nextPos FROM boards WHERE account_id = ?',
            [accountId]
        );
        
        const [result] = await db.query(
            'INSERT INTO boards (account_id, name, description, position) VALUES (?, ?, ?, ?)',
            [accountId, name, description, maxPos[0].nextPos]
        );
        return result.insertId;
    },

    async findById(id) {
        const [boards] = await db.query(
            'SELECT * FROM boards WHERE id = ?',
            [id]
        );
        return boards[0];
    },

    async findByAccountId(accountId) {
        const [boards] = await db.query(
            'SELECT * FROM boards WHERE account_id = ? ORDER BY position',
            [accountId]
        );
        return boards;
    },

    async countByAccountId(accountId) {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM boards WHERE account_id = ?',
            [accountId]
        );
        return result[0].count;
    },

    async update(id, data) {
        const fields = [];
        const values = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }

        if (fields.length === 0) return;

        values.push(id);
        await db.query(
            `UPDATE boards SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
    },

    async delete(id) {
        await db.query('DELETE FROM boards WHERE id = ?', [id]);
    },

    async getWithListsAndCards(id) {
        // Get board
        const [boards] = await db.query('SELECT * FROM boards WHERE id = ?', [id]);
        if (boards.length === 0) return null;

        const board = boards[0];

        // Get lists with cards
        const [lists] = await db.query(
            'SELECT * FROM lists WHERE board_id = ? ORDER BY position',
            [id]
        );

        for (const list of lists) {
            const [cards] = await db.query(
                `SELECT c.*, 
                    (SELECT COUNT(*) FROM attachments WHERE card_id = c.id) as attachment_count
                 FROM cards c 
                 WHERE c.list_id = ? 
                 ORDER BY c.position`,
                [list.id]
            );
            list.cards = cards;
        }

        board.lists = lists;
        return board;
    }
};

module.exports = Board;
