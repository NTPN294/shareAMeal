const express = require('express');

const app = express();
const port = process.env.port || 8080;

app.use(express.json());
let database = []
let id = 0;

const result = {
    code: 200,
    message: "hello world",
};
// ====================functions

function isValidEmailAddress(email) {
    const emailRegex = /^[a-zA-Z]{1}\.[a-zA-Z]{2,}@([a-zA-Z]{2,})\.([a-zA-Z]{2,3})$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
}

function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^06[- ]?\d{8}$/;
    return phoneRegex.test(phoneNumber);
}

//========================= routes
app.get('/', (req, res) => {
    res.json(result);
});

// info
app.get('/api/info', (req, res) => {
    console.log('GET /api/info')
    const info = {
        name: 'My Nodejs Express server',
        version: '0.0.1',
        description: 'This is a simple Nodejs Express server'
    }
    res.json(info)
})

//uc-201 register
app.post('/api/user', (req, res) => {
    let newUser = req.body;

    // Check if any required field is missing in the request body
    if (!newUser.firstName || !newUser.lastName || !newUser.password || !newUser.emailAddress || !newUser.phoneNumber || !newUser.street || !newUser.city || !newUser.isActive) {
        return res.status(400).json({
            code: 400,
            message: "Missing required fields",
            requiredFields: ["firstName", "lastName", "password", "emailAddress", "phoneNumber", "street", "city", "isActive"]
        });
    }

    //validators
    if (isValidEmailAddress(newUser.emailAddress) === false) {
        return res.status(400).json({
            code: 400,
            message: "Invalid email address",
        });
    }

    if (isValidPassword(newUser.password) === false) {
        return res.status(400).json({
            code: 400,
            message: "Invalid password",
        });
    }

    if (isValidPhoneNumber(newUser.phoneNumber) === false) {    
        return res.status(400).json({
            code: 400,
            message: "Invalid phone number",
        });
    }
    

    //check if user exists in the database
    const existingUser = database.find(userDB => userDB.email === newUser.emailAddress);
    if (existingUser) {
        res.status(400).json({
            code: 400,
            message: "User already exists",
        });
        return;
    }

    id++;

    newUser = {
        id,
       ... newUser
    };

    database.push(newUser);
    console.log(database);
    res.json(newUser);

});

//uc-202 get users
app.get('/api/user', (req, res) => {
    res.json(database);
});

//uc-202 filter fields
app.get('/api/user?field1=:value1&field2=:value2', (req, res) => {
    const field1 = req.params.field1;
    const field2 = req.params.field2;

    let user = database.find(user => user.field1 == value1 && user.field2 == value2);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({
            code: 404,
            message: "User not found",
        });
    }
});

//uc-204 get user from id
app.get('/api/user/:userid', (req, res) => {
    const userid = req.params.userid;
    let user = database.find(user => user.id == userid);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({
            code: 404,
            message: "User not found",
        });
    }

});

//uc-205 update user from id
app.put('/api/user/:userid', (req, res) => {
    let user = req.body;

    // Check if any required field is missing in the request body
    if (!user.firstName || !user.lastName || !user.password || !user.emailAddress || !user.phoneNumber || !user.street || !user.city || !user.isActive) {
        return res.status(400).json({
            code: 400,
            message: "Missing required fields",
            requiredFields: ["firstName", "lastName", "password", "emailAddress", "phoneNumber", "street", "city", "isActive"]
        });
    }

    //validators
    if (isValidEmailAddress(user.emailAddress) === false) {
        return res.status(400).json({
            code: 400,
            message: "Invalid email address",
        });
    }

    if (isValidPassword(user.password) === false) {
        return res.status(400).json({
            code: 400,
            message: "Invalid password",
        });
    }

    if (isValidPhoneNumber(user.phoneNumber) === false) {    
        return res.status(400).json({
            code: 400,
            message: "Invalid phone number",
        });
    }

    //check if user exists in the database and update
    let oldUser = database.find(oldUser => oldUser.id == user.id);
    const userIndex = database.findIndex(oldUser => oldUser.id == user.id);

    if (oldUser) {    
        database[userIndex] = user;
        res.json(database[userIndex]);

    } else {
        res.status(404).json({
            code: 404,
            message: "User not found",
        });
    }
});

//uc-206 delete user rfom id
app.delete('/api/user/:userid', (req, res) => {
    const userid = req.params.userid;
    let user = database.find(user => user.id == userid);
    if (user) {
        database = database.filter(user => user.id != userid);
        res.json(user);
    } else {
        res.status(404).json({
            code: 404,
            message: "User not found",
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://${port}/`);
});