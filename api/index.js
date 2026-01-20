// Simple Vercel Serverless Handler
const app = require('express')();
const cors = require('cors');

app.use(cors({ origin: '*' }));
app.use(require('express').json());

// Test endpoint
app.get('/api', (req, res) => {
    res.json({ 
        name: 'Trello API', 
        status: 'running',
        time: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Auth routes (simplified for testing)
app.post('/api/auth/login', (req, res) => {
    res.json({ message: 'Login endpoint works', body: req.body });
});

app.post('/api/auth/register', (req, res) => {
    res.json({ message: 'Register endpoint works' });
});

// Catch all
app.all('*', (req, res) => {
    res.status(404).json({ 
        error: 'Not found', 
        path: req.path,
        method: req.method 
    });
});

module.exports = app;
