const { get } = require('../..')
const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const mealService = {
    create:(meal, callback) => {
        logger.info('create meal', meal)

        database.addMeal(meal, (err, data) => {
            if (err) {
                logger.info(
                    'error creating meal: ',
                    err.message || 'unknown error'
                )
                callback(err, {
                    status: 403,
                    message: err.message || 'unknown error',
                })
            } else {
                logger.trace(`Meal created with id ${data.id}.`)
                callback(null, {
                    status: 201,
                    message: `Meal created with id ${data.id}.`,
                    data: data
                })
            }
        })
    },

    getAll: (callback) => {
        logger.info('getAll')
        database.getAllMeals((err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    status: 200,
                    message: `Found ${data.length} meals.`,
                    data: data
                })
            }
        })
    },

    getById:(mealId, callback) => {
        logger.info(`getById ${mealId}`)

        if (isNaN(mealId)) {
            const error = new Error("Invalid id");
            error.status = 401; // Set the status code to 400 for Bad Request
            callback(error, null);
            return;
        }

        database.getByIdMeal(mealId, (err, data) => {
            if (err) {
                const error = new Error(`Error fetching meal with id ${mealId}`);
                error.status = 500; // Set the status code to 500 for Internal Server Error
                callback(error, null);
                return;
            }

            if (!data) {
                const error = new Error(`Meal with id ${mealId} not found`);
                error.status = 404; // Set the status code to 404 for Not Found
                callback(error, null);
                return;
            }

            callback(null, {
                status: 200,
                message: `Found meal with id ${mealId}.`,
                data: data
            })
        })
    },

    deleteMeal: (mealId, callback) => {
        logger.info(`deleteMeal ${mealId}`)

        if (isNaN(mealId)) {
            const error = new Error("Invalid id");
            error.status = 401; // Set the status code to 400 for Bad Request
            callback(error, null);
            return;
        }

        database.deleteMeal(mealId, (err, data) => {
            if (err) {
                const error = new Error(`Error deleting meal with id ${mealId}`);
                error.status = 500; // Set the status code to 500 for Internal Server Error
                callback(error, null);
                return;
            }

            if (!data) {
                const error = new Error(`Meal with id ${mealId} not found`);
                error.status = 404; // Set the status code to 404 for Not Found
                callback(error, null);
                return;
            }

            callback(null, {
                status: 200,
                message: `Deleted meal with id ${mealId}.`,
                data: data
            })
        })
    },

    update:(mealId, updatedFields, callback) => {
        logger.info(`update meal with id ${mealId}`)

        if (isNaN(mealId)) {
            const error = new Error("Invalid id");
            error.status = 401; // Set the status code to 400 for Bad Request
            callback(error, null);
            return;
        }

        database.updateMeal(mealId, updatedFields, (err, data) => {
            if (err) {
                const error = new Error(`Error updating meal with id ${mealId}`);
                error.status = 500; // Set the status code to 500 for Internal Server Error
                callback(error, null);
                return;
            }

            if (!data) {
                const error = new Error(`Meal with id ${mealId} not found`);
                error.status = 404; // Set the status code to 404 for Not Found
                callback(error, null);
                return;
            }

            callback(null, {
                status: 200,
                message: `Updated meal with id ${mealId}.`,
                data: data
            })
        })
    }
}

module.exports = mealService
