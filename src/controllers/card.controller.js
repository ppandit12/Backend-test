const multer = require('multer');
const path = require('path');
const Card = require('../models/Card');
const List = require('../models/List');
const Board = require('../models/Board');
const Attachment = require('../models/Attachment');
const { AppError } = require('../middleware/errorHandler');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
    }
});

// Helper to verify card ownership
async function verifyCardOwnership(cardId, accountId) {
    const card = await Card.findById(cardId);
    if (!card) return { error: 'Card not found', status: 404 };

    const list = await List.findById(card.list_id);
    const board = await Board.findById(list.board_id);

    if (board.account_id !== accountId) {
        return { error: 'Access denied', status: 403 };
    }

    return { card, list, board };
}

const cardController = {
    upload: upload.single('file'),

    async create(req, res, next) {
        try {
            const listId = parseInt(req.params.listId);
            const list = await List.findById(listId);

            if (!list) {
                throw new AppError('List not found', 404);
            }

            const board = await Board.findById(list.board_id);
            if (board.account_id !== req.user.account_id) {
                throw new AppError('Access denied', 403);
            }

            const { title, description, dueDate } = req.body;
            const cardId = await Card.create(listId, title, description, dueDate);
            const card = await Card.findById(cardId);

            res.status(201).json({ card });
        } catch (error) {
            next(error);
        }
    },

    async getOne(req, res, next) {
        try {
            const cardId = parseInt(req.params.id);
            const result = await verifyCardOwnership(cardId, req.user.account_id);

            if (result.error) {
                throw new AppError(result.error, result.status);
            }

            const card = await Card.getWithAttachments(cardId);
            res.json({ card });
        } catch (error) {
            next(error);
        }
    },

    async update(req, res, next) {
        try {
            const cardId = parseInt(req.params.id);
            const result = await verifyCardOwnership(cardId, req.user.account_id);

            if (result.error) {
                throw new AppError(result.error, result.status);
            }

            const { title, description, dueDate } = req.body;
            await Card.update(cardId, { title, description, dueDate });
            const card = await Card.findById(cardId);

            res.json({ card });
        } catch (error) {
            next(error);
        }
    },

    async delete(req, res, next) {
        try {
            const cardId = parseInt(req.params.id);
            const result = await verifyCardOwnership(cardId, req.user.account_id);

            if (result.error) {
                throw new AppError(result.error, result.status);
            }

            await Card.delete(cardId);
            res.json({ message: 'Card deleted successfully' });
        } catch (error) {
            next(error);
        }
    },

    async move(req, res, next) {
        try {
            const cardId = parseInt(req.params.id);
            const { listId: targetListId, position } = req.body;

            const result = await verifyCardOwnership(cardId, req.user.account_id);
            if (result.error) {
                throw new AppError(result.error, result.status);
            }

            // Verify target list belongs to same board
            if (targetListId) {
                const targetList = await List.findById(targetListId);
                if (!targetList) {
                    throw new AppError('Target list not found', 404);
                }
                if (targetList.board_id !== result.board.id) {
                    throw new AppError('Cannot move card to a different board', 400);
                }
            }

            await Card.move(cardId, targetListId || result.card.list_id, position);
            const card = await Card.findById(cardId);

            res.json({ card });
        } catch (error) {
            next(error);
        }
    },

    async uploadAttachment(req, res, next) {
        try {
            const cardId = parseInt(req.params.id);
            const result = await verifyCardOwnership(cardId, req.user.account_id);

            if (result.error) {
                throw new AppError(result.error, result.status);
            }

            if (!req.file) {
                throw new AppError('No file uploaded', 400);
            }

            const attachmentId = await Attachment.create(
                cardId,
                req.file.filename,
                req.file.originalname,
                req.file.mimetype,
                req.file.size
            );

            const attachment = await Attachment.findById(attachmentId);

            res.status(201).json({ attachment });
        } catch (error) {
            next(error);
        }
    },

    async deleteAttachment(req, res, next) {
        try {
            const attachmentId = parseInt(req.params.attachmentId);
            const attachment = await Attachment.findById(attachmentId);

            if (!attachment) {
                throw new AppError('Attachment not found', 404);
            }

            // Verify ownership through card
            const result = await verifyCardOwnership(attachment.card_id, req.user.account_id);
            if (result.error) {
                throw new AppError(result.error, result.status);
            }

            await Attachment.delete(attachmentId);
            res.json({ message: 'Attachment deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = cardController;
