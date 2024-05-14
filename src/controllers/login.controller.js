const loginService = require('../services/login.service')
const logger = require('../util/logger')
const jwt = require('./jwtUtil');
require('dotenv').config();


let loginController = {

    login: (req, res, next) => {
        const { emailAdress, password } = req.body

        logger.info('login', emailAdress)
        loginService.login(emailAdress, password, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                })
            }
            if (success) {

                const token = jwt.generate(success.data);            

                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data,
                    token: token
                })


            }
        })
    }
}

module.exports = loginController