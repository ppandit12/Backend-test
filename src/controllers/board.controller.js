const Board = require('../models/Board');
const Account = require('../models/Account');
const { AppError } = require('../middleware/errorHandler');

const FREE_BOARD_LIMIT = 10;

const boardController = {
    async getAll(req, res, next) {
        try {
            const boards = await Board.findByAccountId(req.user.account_id);
            res.json({ boards });
        } catch (error) {
            next(error);
        }
    },

    async getOne(req, res, next) {
        try {
            const board = await Board.getWithListsAndCards(parseInt(req.params.id));
            
            if (!board) {
                throw new AppError('Board not found', 404);
            }

            // Check ownership
            if (board.account_id !== req.user.account_id) {
                throw new AppError('Access denied', 403);
            }

            res.json({ board });
        } catch (error) {
            next(error);
        }
    },

    async create(req, res, next) {
        try {
            // Check board limit for free accounts
            const isPremium = await Account.isPremium(req.user.account_id);
            if (!isPremium) {
                const boardCount = await Board.countByAccountId(req.user.account_id);
                if (boardCount >= FREE_BOARD_LIMIT) {
                    throw new AppError(
                        `Free accounts are limited to ${FREE_BOARD_LIMIT} boards. Upgrade to premium for unlimited boards.`,
                        403
                    );
                }
            }

            const { name, description } = req.body;
            const boardId = await Board.create(req.user.account_id, name, description);
            const board = await Board.findById(boardId);

            res.status(201).json({ board });
        } catch (error) {
            next(error);
        }
    },

    async update(req, res, next) {
        try {
            const boardId = parseInt(req.params.id);
            const board = await Board.findById(boardId);

            if (!board) {
                throw new AppError('Board not found', 404);
            }

            if (board.account_id !== req.user.account_id) {
                throw new AppError('Access denied', 403);
            }

            await Board.update(boardId, req.body);
            const updatedBoard = await Board.findById(boardId);

            res.json({ board: updatedBoard });
        } catch (error) {
            next(error);
        }
    },

    async delete(req, res, next) {
        try {
            const boardId = parseInt(req.params.id);
            const board = await Board.findById(boardId);

            if (!board) {
                throw new AppError('Board not found', 404);
            }

            if (board.account_id !== req.user.account_id) {
                throw new AppError('Access denied', 403);
            }

            await Board.delete(boardId);

            res.json({ message: 'Board deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = boardController;
