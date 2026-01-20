const express = require('express');
const { body } = require('express-validator');
const listController = require('../controllers/list.controller');
const cardController = require('../controllers/card.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(auth);

// PATCH /api/lists/:id
router.patch('/:id', [
    body('name').trim().isLength({ min: 1 }).withMessage('List name is required')
], validate, listController.update);

// DELETE /api/lists/:id
router.delete('/:id', listController.delete);

// PATCH /api/lists/:id/move
router.patch('/:id/move', [
    body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer')
], validate, listController.move);

// Nested card routes
// POST /api/lists/:listId/cards
router.post('/:listId/cards', [
    body('title').trim().isLength({ min: 1 }).withMessage('Card title is required'),
    body('description').optional().trim(),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date')
], validate, cardController.create);

module.exports = router;
