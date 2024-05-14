const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const loginService = {
    login: (emailAdress, password, callback) => {
        logger.info(`login ${emailAdress}`)
        database.login(emailAdress, password, (err, data) => {
            if (err) {
                logger.info(
                    'error login: ',
                    err.message || 'unknown error'
                )
                callback(err, {
                    status: err.status,
                    message: err.message,
                })
            } else {
                logger.trace(`User logged in with id ${data.id}.`)
                callback(null, {
                    status: 200,
                    message: `User logged in with id ${data.id}.`,
                    data: data
                })
            }
        })
    }
}

module.exports = loginService
