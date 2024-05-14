const mealParticipantService = require('../services/mealParticipant.service')
const logger = require('../util/logger')
const jwtUtil = require('../controllers/jwtUtil');
const database = require('../dao/inmem-db')


let mealParticipantController = {
    create: (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

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
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const userId = parseInt(req.headers.id); 

        if (userId !== jwtUtil.getUserId(token)) {
            return res.status(401).json({ error: 'Unauthorized: Not a participant of this meal' });
        }

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
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }
        const userId = jwtUtil.getUserId(token);

        const mealId = parseInt(req.params.mealId)
        const cook = database._data.meals.find(meal => meal.id === mealId).cookId
        
        if (userId !== cook) {
            return res.status(401).json({ error: 'Unauthorized: Not the cook of this meal' });
        }



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
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const userId = parseInt(req.params.participantId); 
        const mealId = parseInt(req.params.mealId)
        const userIdToken = jwtUtil.getUserId(token);

        const cook = database._data.meals.find(meal => meal.id === mealId).cookId
        
        if (userIdToken !== cook) {
            return res.status(401).json({ error: 'Unauthorized: Not the cook of this meal' });
        }
    
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