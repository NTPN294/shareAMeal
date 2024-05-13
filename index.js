const express = require('express')
const userRoutes = require('./src/routes/user.routes')
const logger = require('./src/util/logger')
const mysql = require('./src/dao/mySql')

const app = express()

// express.json zorgt dat we de body van een request kunnen lezen
app.use(express.json())
const port = process.env.PORT || 3000

mysql.getUsers((err, data) => {
    if (err) {
        logger.error('Error getting users:', err)
    } else {
        logger.info('Users:', data)
    }
})

// Hier komen alle routes
app.use(userRoutes)

// Route error handler
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
})

// Hier komt je Express error handler te staan!
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    })
})

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`)
})

// Deze export is nodig zodat Chai de server kan opstarten
module.exports = app
