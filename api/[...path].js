// Catch-all Vercel Serverless Handler for Express
const app = require('express')();
const cors = require('cors');

// CORS
app.use(cors({ origin: '*' }));
app.use(require('express').json());

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

// Auth routes
app.post('/api/auth/login', (req, res) => {
    res.json({ message: 'Login endpoint reached', received: req.body });
});

app.post('/api/auth/register', (req, res) => {
    res.json({ message: 'Register endpoint reached' });
});

app.get('/api/auth/me', (req, res) => {
    res.json({ message: 'Me endpoint reached' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Catch-all 404
app.all('*', (req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
});

module.exports = app;
