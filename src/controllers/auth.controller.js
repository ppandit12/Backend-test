const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');
const { AppError } = require('../middleware/errorHandler');

const authController = {
    async register(req, res, next) {
        try {
            const { email, password, name } = req.body;

            // Check if user exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                throw new AppError('Email already registered', 409);
            }

            // Create user and account in sequence
            const userId = await User.create(email, password, name);
            const accountId = await Account.create(userId, 'free');

            // Generate token
            const token = jwt.sign(
                { userId },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(201).json({
                message: 'Registration successful',
                token,
                user: {
                    id: userId,
                    email,
                    name,
                    accountType: 'free'
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const user = await User.findByEmail(email);
            if (!user) {
                throw new AppError('Invalid credentials', 401);
            }

            const isValidPassword = await User.verifyPassword(password, user.password);
            if (!isValidPassword) {
                throw new AppError('Invalid credentials', 401);
            }

            const account = await Account.findByUserId(user.id);

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    accountType: account.type
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async me(req, res, next) {
        try {
            res.json({
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    name: req.user.name,
                    accountId: req.user.account_id,
                    accountType: req.user.account_type
                }
            });
        } catch (error) {
            next(error);
        }
    },

    async upgrade(req, res, next) {
        try {
            await Account.upgrade(req.user.account_id);

            res.json({
                message: 'Account upgraded to premium',
                accountType: 'premium'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
