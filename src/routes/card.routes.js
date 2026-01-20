const express = require('express');
const { body } = require('express-validator');
const cardController = require('../controllers/card.controller');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/cards/:id
router.get('/:id', cardController.getOne);

// PATCH /api/cards/:id
router.patch('/:id', [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Card title cannot be empty'),
    body('description').optional().trim(),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid ISO date')
], validate, cardController.update);

// DELETE /api/cards/:id
router.delete('/:id', cardController.delete);

// PATCH /api/cards/:id/move
router.patch('/:id/move', [
    body('listId').optional().isInt({ min: 1 }).withMessage('List ID must be a positive integer'),
    body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer')
], validate, cardController.move);

// POST /api/cards/:id/attachments
router.post('/:id/attachments', cardController.upload, cardController.uploadAttachment);

// DELETE /api/cards/:id/attachments/:attachmentId
router.delete('/:id/attachments/:attachmentId', cardController.deleteAttachment);

module.exports = router;
