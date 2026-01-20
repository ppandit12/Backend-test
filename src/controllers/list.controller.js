const List = require('../models/List');
const Board = require('../models/Board');
const { AppError } = require('../middleware/errorHandler');

const listController = {
    async create(req, res, next) {
        try {
            const boardId = parseInt(req.params.boardId);
            const board = await Board.findById(boardId);

            if (!board) {
                throw new AppError('Board not found', 404);
            }

            if (board.account_id !== req.user.account_id) {
                throw new AppError('Access denied', 403);
            }

            const { name } = req.body;
            const listId = await List.create(boardId, name);
            const list = await List.findById(listId);

            res.status(201).json({ list });
        } catch (error) {
            next(error);
        }
    },

    async update(req, res, next) {
        try {
            const listId = parseInt(req.params.id);
            const list = await List.findById(listId);

            if (!list) {
                throw new AppError('List not found', 404);
            }

            // Check ownership through board
            const board = await Board.findById(list.board_id);
            if (board.account_id !== req.user.account_id) {
                throw new AppError('Access denied', 403);
            }

            await List.update(listId, req.body.name);
            const updatedList = await List.findById(listId);

            res.json({ list: updatedList });
        } catch (error) {
            next(error);
        }
    },

    async delete(req, res, next) {
        try {
            const listId = parseInt(req.params.id);
            const list = await List.findById(listId);

            if (!list) {
                throw new AppError('List not found', 404);
            }

            const board = await Board.findById(list.board_id);
            if (board.account_id !== req.user.account_id) {
                throw new AppError('Access denied', 403);
            }

            await List.delete(listId);

            res.json({ message: 'List deleted successfully' });
        } catch (error) {
            next(error);
        }
    },

    async move(req, res, next) {
        try {
            const listId = parseInt(req.params.id);
            const { position } = req.body;

            const list = await List.findById(listId);
            if (!list) {
                throw new AppError('List not found', 404);
            }

            const board = await Board.findById(list.board_id);
            if (board.account_id !== req.user.account_id) {
                throw new AppError('Access denied', 403);
            }

            await List.move(listId, position);
            const updatedList = await List.findById(listId);

            res.json({ list: updatedList });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = listController;
