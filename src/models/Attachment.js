const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

const Attachment = {
    async create(cardId, filename, originalName, mimetype, size) {
        const [result] = await db.query(
            'INSERT INTO attachments (card_id, filename, original_name, mimetype, size) VALUES (?, ?, ?, ?, ?)',
            [cardId, filename, originalName, mimetype, size]
        );
        return result.insertId;
    },

    async findById(id) {
        const [attachments] = await db.query(
            'SELECT * FROM attachments WHERE id = ?',
            [id]
        );
        return attachments[0];
    },

    async findByCardId(cardId) {
        const [attachments] = await db.query(
            'SELECT * FROM attachments WHERE card_id = ? ORDER BY created_at DESC',
            [cardId]
        );
        return attachments;
    },

    async delete(id) {
        const attachment = await this.findById(id);
        if (!attachment) return;

        // Delete file from disk
        const filePath = path.join(__dirname, '../../uploads', attachment.filename);
        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.error('Failed to delete file:', err.message);
        }

        await db.query('DELETE FROM attachments WHERE id = ?', [id]);
    },

    async getCardId(attachmentId) {
        const [attachments] = await db.query(
            'SELECT card_id FROM attachments WHERE id = ?',
            [attachmentId]
        );
        return attachments[0]?.card_id;
    }
};

module.exports = Attachment;
