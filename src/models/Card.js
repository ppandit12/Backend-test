const db = require('../config/database');

const Card = {
    async create(listId, title, description = null, dueDate = null) {
        // Get max position
        const [maxPos] = await db.query(
            'SELECT COALESCE(MAX(position), -1) + 1 as nextPos FROM cards WHERE list_id = ?',
            [listId]
        );
        
        const [result] = await db.query(
            'INSERT INTO cards (list_id, title, description, position, due_date) VALUES (?, ?, ?, ?, ?)',
            [listId, title, description, maxPos[0].nextPos, dueDate]
        );
        return result.insertId;
    },

    async findById(id) {
        const [cards] = await db.query(
            'SELECT * FROM cards WHERE id = ?',
            [id]
        );
        return cards[0];
    },

    async findByListId(listId) {
        const [cards] = await db.query(
            'SELECT * FROM cards WHERE list_id = ? ORDER BY position',
            [listId]
        );
        return cards;
    },

    async update(id, data) {
        const fields = [];
        const values = [];

        if (data.title !== undefined) {
            fields.push('title = ?');
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.dueDate !== undefined) {
            fields.push('due_date = ?');
            values.push(data.dueDate);
        }

        if (fields.length === 0) return;

        values.push(id);
        await db.query(
            `UPDATE cards SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
    },

    async delete(id) {
        await db.query('DELETE FROM cards WHERE id = ?', [id]);
    },

    async move(id, targetListId, newPosition) {
        const card = await this.findById(id);
        if (!card) return;

        const sameList = card.list_id === targetListId;

        if (sameList) {
            // Moving within the same list
            const oldPosition = card.position;

            if (newPosition > oldPosition) {
                await db.query(
                    `UPDATE cards SET position = position - 1 
                     WHERE list_id = ? AND position > ? AND position <= ?`,
                    [card.list_id, oldPosition, newPosition]
                );
            } else if (newPosition < oldPosition) {
                await db.query(
                    `UPDATE cards SET position = position + 1 
                     WHERE list_id = ? AND position >= ? AND position < ?`,
                    [card.list_id, newPosition, oldPosition]
                );
            }

            await db.query(
                'UPDATE cards SET position = ? WHERE id = ?',
                [newPosition, id]
            );
        } else {
            // Moving to different list
            // Close gap in source list
            await db.query(
                `UPDATE cards SET position = position - 1 
                 WHERE list_id = ? AND position > ?`,
                [card.list_id, card.position]
            );

            // Make room in target list
            await db.query(
                `UPDATE cards SET position = position + 1 
                 WHERE list_id = ? AND position >= ?`,
                [targetListId, newPosition]
            );

            // Move card
            await db.query(
                'UPDATE cards SET list_id = ?, position = ? WHERE id = ?',
                [targetListId, newPosition, id]
            );
        }
    },

    async getWithAttachments(id) {
        const card = await this.findById(id);
        if (!card) return null;

        const [attachments] = await db.query(
            'SELECT * FROM attachments WHERE card_id = ? ORDER BY created_at DESC',
            [id]
        );
        card.attachments = attachments;
        return card;
    },

    async getListId(cardId) {
        const [cards] = await db.query(
            'SELECT list_id FROM cards WHERE id = ?',
            [cardId]
        );
        return cards[0]?.list_id;
    }
};

module.exports = Card;
