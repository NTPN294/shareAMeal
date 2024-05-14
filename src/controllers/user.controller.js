const userService = require('../services/user.service')
const logger = require('../util/logger')
const jwtUtil = require('../controllers/jwtUtil')

let userController = {
    create: (req, res, next) => {
        const user = req.body
        logger.info('create user', user.firstName, user.lastName)
        userService.create(user, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                })
            }
            if (success) {
                res.status(201).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    getAll: (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        // Authenticate user before proceeding to retrieve all users
        jwtUtil.authenticate(req, res, () => {
            // Authentication successful, proceed with retrieving all users
            logger.trace('getAll');
            userService.getAll((error, success) => {
                if (error) {
                    return next({
                        status: error.status,
                        message: error.message,
                    });
                }
                if (success) {
                    res.status(200).json({
                        status: success.status,
                        message: success.message,
                        data: {
                            users: success.data,
                            activeUsers: success.data.filter(user => user.isActive),
                            inActiveUsers: success.data.filter(user => !user.isActive)
                        }
                    });
                }
            });
        });
    },

    getById: (req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        let userId = parseInt(req.params.userId)
        if (isNaN(userId)) {
            userId = jwtUtil.getUserId(req.headers.authorization);
        }

        logger.trace('userController: getById', userId)
        userService.getById(userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    update: (req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const userId = parseInt(req.params.userId);
        const tokenUserId = jwtUtil.getUserId(req.headers.authorization);
        if (userId !== tokenUserId) {
            return next({
                status: 403,
                message: 'Forbidden: You are not allowed to update this user'
            });
        }

        const updatedFields = req.body;
        logger.info('Update user with ID:', userId);
        userService.updateUser(userId, updatedFields, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                });
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    delete: (req, res, next) => {
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const userId = parseInt(req.params.userId);
        const tokenUserId = jwtUtil.getUserId(req.headers.authorization);
        if (userId !== tokenUserId) {
            return next({
                status: 403,
                message: 'Forbidden: You are not allowed to delete this user'
            });
        }

        logger.info('Delete user with ID:', userId);
        userService.deleteUser(userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                });
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

    login: (req, res, next) => {
        const user = req.body;
        logger.info('Login user', user.emailAdress);
        userService.login(user, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                });
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },

 

}

module.exports = userController
