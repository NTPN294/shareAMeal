const loginService = require('../services/login.service')
const logger = require('../util/logger')
const jwt = require('./jwtUtil');
require('dotenv').config();
const axios = require('axios');


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

                const token = jwt.generate(emailAdress);

                axios.get('/api/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                    .then(response => {
                        console.log(response.data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });


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