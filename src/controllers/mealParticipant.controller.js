const mealParticipantService = require('../services/mealParticipant.service')
const logger = require('../util/logger')

let mealParticipantController = {
    create: (req, res, next) => {
        const userId = parseInt(req.headers.id); 
        const mealId = parseInt(req.params.mealId)
        const mealParticipant = {
            userId: userId,
            mealId: mealId
        }
        logger.info('create mealParticipant', mealParticipant)
        mealParticipantService.create(mealParticipant, (error, success) => {
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

    delete: (req, res, next) => {
        const userId = parseInt(req.headers.id); 
        const mealId = parseInt(req.params.mealId)
        const mealParticipant = {
            userId: userId,
            mealId: mealId
        }
        logger.info('delete mealParticipant', mealParticipant)
        mealParticipantService.delete(mealParticipant, (error, success) => {
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

    getMealParticipants: (req, res, next) => {
        const mealId = parseInt(req.params.mealId)
        logger.info('get mealParticipants for meal', mealId)

        mealParticipantService.getMealParticipants(mealId, (error, success) => {
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

    getMealParticipantsByUserId: (req, res, next) => {
        const userId = parseInt(req.params.participantId); 
        const mealId = parseInt(req.params.mealId)
    
        logger.info('get mealParticipants for meal', mealId, 'and user', userId)

        mealParticipantService.getMealParticipantsByUserId(mealId,userId, (error, success) => {
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
    }
}

module.exports = mealParticipantController