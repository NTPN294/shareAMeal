const express = require('express');
const userRoutes = require('./src/routes/user.routes')
const logger = require('./src/util/logger')

const app = express();
const port = process.env.port || 8080;

app.use(express.json());
let database = []
let id = 0;

const result = {
    code: 200,
    message: "hello world",
};



app.get('/', (req, res) => {
    res.json(result);
});

// info
app.get('/api/info', (req, res) => {
    console.log('GET /api/info')
    const info = {
        status: 200,
        message: 'Server info endpoint',
        data: {
            studentName: "Nick Thanh Phong Nguyen",
            studentNumber: 2223623,
        }
    }
    res.json(info)
})

app.use(userRoutes);

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
    console.log(`Server is running at http://${port}/`);
});
