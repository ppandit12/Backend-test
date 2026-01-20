const express = require('express');
const { body } = require('express-validator');
const boardController = require('../controllers/board.controller');
const listController = require('../controllers/list.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/boards
router.get('/', boardController.getAll);

// POST /api/boards
router.post('/', [
    body('name').trim().isLength({ min: 1 }).withMessage('Board name is required'),
    body('description').optional().trim()
], validate, boardController.create);

// GET /api/boards/:id
router.get('/:id', boardController.getOne);

// PATCH /api/boards/:id
router.patch('/:id', [
    body('name').optional().trim().isLength({ min: 1 }).withMessage('Board name cannot be empty'),
    body('description').optional().trim()
], validate, boardController.update);

// DELETE /api/boards/:id
router.delete('/:id', boardController.delete);

// Nested list routes
// POST /api/boards/:boardId/lists
router.post('/:boardId/lists', [
    body('name').trim().isLength({ min: 1 }).withMessage('List name is required')
], validate, listController.create);

module.exports = router;
