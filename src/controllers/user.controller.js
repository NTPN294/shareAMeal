const userService = require('../services/user.service')
const logger = require('../util/logger')

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
        logger.trace('getAll')
        userService.getAll((error, success) => {
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
                    data: success.data,
                    activeUsers: success.data.filter(user => user.isActive),
                    inActiveUsers: success.data.filter(user => !user.isActive)
                })
            }
        })
    },

    getById: (req, res, next) => {
        const userId = parseInt(req.params.userId)
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
        const userId = parseInt(req.params.userId);
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
        const userId = parseInt(req.params.userId);
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
        logger.info('Login user', user.emailAddress);
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
    }

}

module.exports = userController
