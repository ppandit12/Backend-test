// Vercel Serverless Handler - Full API
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('../src/routes/auth.routes');
const boardRoutes = require('../src/routes/board.routes');
const listRoutes = require('../src/routes/list.routes');
const cardRoutes = require('../src/routes/card.routes');
const errorHandler = require('../src/middleware/errorHandler');

const app = express();

// CORS - Allow all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight
app.options('*', cors());

// Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        name: 'Trello-like API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            api: '/api',
            auth: '/api/auth',
            boards: '/api/boards',
            lists: '/api/lists',
            cards: '/api/cards'
        }
    });
});

// API Info
app.get('/api', (req, res) => {
    res.json({ name: 'Trello API', status: 'running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Error handler
app.use(errorHandler);

module.exports = app;
