const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Resource already exists' });
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ error: 'Referenced resource does not exist' });
    }

    // Custom app errors
    if (err.statusCode) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    // Default server error
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
};

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = errorHandler;
module.exports.AppError = AppError;
