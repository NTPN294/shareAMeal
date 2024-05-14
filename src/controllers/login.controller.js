const loginService = require('../services/login.service')
const logger = require('../util/logger')
const jwt = require('./jwtUtil');
require('dotenv').config();
const bcrypt = require('bcrypt')
const database = require('../dao/inmem-db')


let loginController = {

    login: (req, res, next) => {
        let { emailAdress, password } = req.body
        const userDb = database._data.users.find(user => user.emailAdress === emailAdress)
        if (userDb === undefined) {
            return res.status(401).json({ 
                status: 401,
                message: 'User not found' });
        }

        const isPasswordValid = bcrypt.compareSync(password, userDb.password)

        if (!isPasswordValid) {
            // Passwords do not match
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        logger.info('login', emailAdress)
        loginService.login(emailAdress, (error, success) => {
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