const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.port || 3000;  

app.use(bodyParser.json());
let database = []
let id = 0;

const result = {
    code: 200,
    message: "hello world",
};

app.get('/', (req, res) => {
    res.json(result);
});

//uc-201 register
app.post('/api/user', (req, res) => {
    let user = req.body;
    id++;
    user = {
        id,
        ... user,
    };

    database.push(user);
    console.log(database);
    res.json(user);

});

//uc-202 login
app.get('/api/user', (req, res) => {
    res.json(database);
});

//uc-202 filter fields
app.get('api/user?field1=:value1&field2=:value2', (req, res) => {
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
    const userid = req.params.userid;
    let user = database.find(user => user.id == userid);
    if (user) {
        user = {
            ... user,
            ... req.body,
        };
        res.json(user);
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