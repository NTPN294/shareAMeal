const mealService = require('../services/meal.service')
const logger = require('../util/logger')
const jwtUtil = require('../controllers/jwtUtil');
const database = require('../dao/inmem-db')

let mealController = {
    create: (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }
        const cookId = jwtUtil.getUserId(token, res);

        const meal = req.body
        logger.info('create meal', meal.name)
        mealService.create(meal, cookId, (error, success) => {
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

        logger.trace('getAll')
        mealService.getAll((error, success) => {
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
                    data: {
                        meals: success.data,
                        activeMeals: success.data.filter(meal => meal.isActive),
                        inActiveMeals: success.data.filter(meal => !meal.isActive)
                    }
                })
            }
        })
    },

    getById: (req, res, next) => {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const mealId = parseInt(req.params.mealId)
        logger.trace('mealController: getById', mealId)
        mealService.getById(mealId, (error, success) => {
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
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }
        const mealId = parseInt(req.params.mealId)
        let oldMeal = database._data.meals.find(meal => meal.id === mealId)
        const userId = jwtUtil.getUserId(token, res);

        if (oldMeal !== undefined) {
            if (oldMeal.cookId !== userId) {
                return res.status(401).json({ error: 'Unauthorized: Not the cook of this meal' });
            }
        }



        const meal = req.body
        logger.info('update meal', mealId)
        mealService.updateMeal(mealId, meal, userId, (error, success) => {
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

        const mealId = parseInt(req.params.mealId)
        let oldMeal = database._data.meals.find(meal => meal.id === mealId)
        const userId = jwtUtil.getUserId(token, res);

        if (oldMeal !== undefined) {
            if (oldMeal.cookId !== userId) {
                return res.status(401).json({ error: 'Unauthorized: Not the cook of this meal' });
            }
        }

        logger.info('delete meal', mealId)
        mealService.deleteMeal(mealId, (error, success) => {
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

module.exports = mealController
