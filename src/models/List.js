const db = require('../config/database');

const List = {
    async create(boardId, name) {
        // Get max position
        const [maxPos] = await db.query(
            'SELECT COALESCE(MAX(position), -1) + 1 as nextPos FROM lists WHERE board_id = ?',
            [boardId]
        );
        
        const [result] = await db.query(
            'INSERT INTO lists (board_id, name, position) VALUES (?, ?, ?)',
            [boardId, name, maxPos[0].nextPos]
        );
        return result.insertId;
    },

    async findById(id) {
        const [lists] = await db.query(
            'SELECT * FROM lists WHERE id = ?',
            [id]
        );
        return lists[0];
    },

    async findByBoardId(boardId) {
        const [lists] = await db.query(
            'SELECT * FROM lists WHERE board_id = ? ORDER BY position',
            [boardId]
        );
        return lists;
    },

    async update(id, name) {
        await db.query(
            'UPDATE lists SET name = ? WHERE id = ?',
            [name, id]
        );
    },

    async delete(id) {
        await db.query('DELETE FROM lists WHERE id = ?', [id]);
    },

    async move(id, newPosition) {
        const list = await this.findById(id);
        if (!list) return;

        const oldPosition = list.position;

        if (newPosition > oldPosition) {
            // Moving down: shift items between old and new position up
            await db.query(
                `UPDATE lists SET position = position - 1 
                 WHERE board_id = ? AND position > ? AND position <= ?`,
                [list.board_id, oldPosition, newPosition]
            );
        } else if (newPosition < oldPosition) {
            // Moving up: shift items between new and old position down
            await db.query(
                `UPDATE lists SET position = position + 1 
                 WHERE board_id = ? AND position >= ? AND position < ?`,
                [list.board_id, newPosition, oldPosition]
            );
        }

        await db.query(
            'UPDATE lists SET position = ? WHERE id = ?',
            [newPosition, id]
        );
    },

    async getBoardId(listId) {
        const [lists] = await db.query(
            'SELECT board_id FROM lists WHERE id = ?',
            [listId]
        );
        return lists[0]?.board_id;
    }
};

module.exports = List;
