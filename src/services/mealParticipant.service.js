const database = require('../dao/inmem-db')
const logger = require('../util/logger')
const mysql = require('../dao/mySql')

const mealParticipantService = {
    create: (mealParticipant, callback) => {
        logger.info('create mealParticipant', mealParticipant)

        database.addMealParticipant(mealParticipant, (err, data) => {
            if (err) {
                logger.info(
                    'error creating mealParticipant: ',
                    err.message || 'unknown error'
                )
                callback(err, {
                    status: 403,
                    message: err.message || 'unknown error',
                })
            } else {
                logger.trace(`MealParticipant created with id ${data.userId} to meal ${data.mealId}.`)
                callback(null, {
                    status: 200,
                    message: `MealParticipant created with id ${data.userId} to meal ${data.mealId}.`,
                    data: data
                })
                console.log(mealParticipant.mealId, mealParticipant.userId )
                mysql.addMealParticipant(mealParticipant.mealId, mealParticipant.userId)

            }
        })
    },

    delete: (mealParticipant, callback) => {
        logger.info('delete mealParticipant', mealParticipant)

        database.deleteMealParticipant(mealParticipant, (err, data) => {
            if (err) {
                logger.info(
                    'error deleting mealParticipant: ',
                    err.message || 'unknown error'
                )
                callback(err, {
                    status: 403,
                    message: err.message || 'unknown error',
                })
            } else {
                logger.trace(`MealParticipant deleted with id ${data.userId} from meal ${data.mealId}.`)
                callback(null, {
                    status: 200,
                    message: `MealParticipant deleted with id ${data.userId} from meal ${data.mealId}.`,
                    data: data
                })

                mysql.deleteMealParticipant(mealParticipant.mealId, mealParticipant.userId)

            }
        })
    },

    getMealParticipants: (mealId,callback) => {
        database.getMealParticipants(mealId, (err, data) => {
            if (err) {
                logger.info(
                    'error getting mealParticipants: ',
                    err.message || 'unknown error'
                )
                callback(null, {
                    status: 403,
                    message: err.message || 'unknown error',
                })

            } else {
                logger.trace(`MealParticipants retrieved for meal ${mealId}.`)
                callback(null, {
                    status: 200,
                    message: `MealParticipants retrieved for meal ${mealId}.`,
                    data: data
                })
            }
        })
    },

    getMealParticipantsByUserId: (mealId, userId, callback) => {
        database.getMealParticipantsByUserId(mealId, userId, (err, data) => {
            if (err) {
                logger.info(
                    'error getting mealParticipants: ',
                    err.message || 'unknown error'
                )
                callback(null, {
                    status: 403,
                    message: err.message || 'unknown error',
                })

            } else {
                logger.trace(`MealParticipant retrieved for meal ${mealId} and user ${userId}.`)
                callback(null, {
                    status: 200,
                    message: `MealParticipant retrieved for meal ${mealId} and user ${userId}.`,
                    data: data
                })
            }
        })
    }



}

module.exports = mealParticipantService