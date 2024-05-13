const database = require('../dao/inmem-db')
const logger = require('../util/logger')
const mysql = require('../dao/mySql')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)


        database.addUser(user, (err, data) => {

            if (err) {
                logger.info(
                    'error creating user: ',
                    err.message || 'unknown error'
                )
                callback(err, {
                    status: 403,
                    message: err.message || 'unknown error',
                })
            } else {
                logger.trace(`User created with id ${data.id}.`)
                callback(null, {
                    status: 201,
                    message: `User created with id ${data.id}.`,
                    data: data
                })
                mysql.addUser(user)
            }
        })

    },

    getAll: (callback) => {
        logger.info('getAll')
        database.getAllUser((err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    status: 200,
                    message: `Found ${data.length} users.`,
                    data: data
                })
            }
        })
    },

    getById: (userId, callback) => {
        logger.info(`getById ${userId}`)

        if (isNaN(userId)) {
            const error = new Error("Invalid id");
            error.status = 401; // Set the status code to 400 for Bad Request
            callback(error, null);
            return;
        }

        database.getByIdUser(userId, (err, data) => {
            if (err) {
                const error = new Error(`Error fetching user with id ${userId}`);
                error.status = 500; // Set the status code to 500 for Internal Server Error
                callback(error, null);
                return;
            }

            if (!data) {
                const error = new Error(`User with id ${userId} not found`);
                error.status = 404; // Set the status code to 404 for Not Found
                callback(error, null);
            } else {
                callback(null, {
                    status: 200,
                    message: `Found user with id ${userId}`,
                    data: data
                });
            }
        });
    },


    deleteUser: (userId, callback) => {
        logger.info(`Deleting user with id ${userId}.`);
        database.deleteUser(userId, (err, deletedUser) => {
            if (err) {
                logger.error(`Error deleting user with id ${userId}:`, err.message || 'Unknown error');
                callback(err, null);
            } else {
                const message = `User with id ${userId} deleted.`;
                logger.trace(message);
                callback(null, {
                    message: message,
                    data: deletedUser
                });
                mysql.deleteUser(userId)
            }
        });
    },

    updateUser: (userId, updatedFields, callback) => {
        logger.info(`Updating user with id ${userId}.`);
        database.updateUser(userId, updatedFields, (err, updatedUser) => {
            if (err) {
                logger.error(`Error updating user with id ${userId}:`, err.message || 'Unknown error');
                callback(err, null);
            } else {
                const message = `User with id ${userId} updated.`;
                logger.trace(message);
                callback(null, {
                    status: 200,
                    message: message,
                    data: updatedUser
                });
                mysql.updateUser(userId, updatedFields)
            }
        });
    },

    login: (email, password, callback) => {
        logger.info(`Logging in user with email ${email}.`);
        database.getByEmailUser(email, (err, user) => {
            if (err) {
                logger.error(`Error logging in user with email ${email}:`, err.message || 'Unknown error');
                callback(err, null);
            } else if (!user) {
                const message = `User with email ${email} not found.`;
                logger.trace(message);
                callback(null, {
                    status: 404,
                    message: message,
                    data: null
                });
            } else if (user.password !== password) {
                const message = `Incorrect password for user with email ${email}.`;
                logger.trace(message);
                callback(null, {
                    status: 400,
                    message: message,
                    data: null
                });
            } else {
                const message = `User with email ${email} logged in.`;
                logger.trace(message);
                callback(null, {
                    status: 200,
                    message: message,
                    data: user
                });
            }
        });

    }
};

module.exports = userService
