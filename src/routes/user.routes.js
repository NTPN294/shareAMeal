const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const mealController = require('../controllers/meal.controller')
const logger = require('../util/logger')
const mysql = require('../dao/mySql')


//functions =========================================
function isValidEmailAdress(email) {
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

//========================== validate

const validateUserCreateChaiExpect = (req, res, next) => {
    try {
        // Assert that all required fields exist and are of correct types
        chai.expect(req.body.firstName, 'Missing or incorrect firstName field').to.be.a('string').and.not.empty;
        chai.expect(req.body.lastName, 'Missing or incorrect lastName field').to.be.a('string').and.not.empty;
        chai.expect(req.body.isActive, 'Missing or incorrect isActive field').to.be.a('boolean');
        chai.expect(req.body.emailAdress, 'Missing or incorrect emailAdress field').to.be.a('string').and.not.empty;
        chai.expect(req.body.password, 'Missing or incorrect password field').to.be.a('string').and.not.empty;
        chai.expect(req.body.phoneNumber, 'Missing or incorrect phoneNumber field').to.be.a('string').and.not.empty;
        chai.expect(req.body.street, 'Missing or incorrect street field').to.be.a('string').and.not.empty;
        chai.expect(req.body.city, 'Missing or incorrect city field').to.be.a('string').and.not.empty;

        // Additional validations
        if (!isValidPassword(req.body.password)) {
            throw new Error('Invalid password: Password must contain at least 8 characters, including at least 1 uppercase letter and 1 digit');
        }
        if (!isValidEmailAdress(req.body.emailAdress)) {
            throw new Error('Invalid email adress: j.doe@company.com format expected');
        }
        if (!isValidPhoneNumber(req.body.phoneNumber)) {
            throw new Error('Invalid phone number: Phone number must be in the format 0612345678');
        }

        logger.trace('User successfully validated');
        next(); // Move to the next middleware
    } catch (error) {
        logger.trace('User validation failed:', error.message);
        next({
            status: 400,
            message: error.message,
            data: {}
        });
    }
}

//==================================================
// Middleware to load user and meal data
const refreshData = async (req, res, next) => {
    try {
        const users = await getUsers();
        const meals = await getMeals();
        req.customData = { users, meals }; // Attach data to request object
        next();
    } catch (error) {
        logger.error('Error refreshing data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
};

// Function to retrieve users from database (promisified version)
const getUsers = () => {
    return new Promise((resolve, reject) => {
        mysql.getUsers((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

// Function to retrieve meals from database (promisified version)
const getMeals = () => {
    return new Promise((resolve, reject) => {
        mysql.getMeals((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

// Userroutes
router.get('/api/info', (req, res) => {
    res.json({
        studentName: 'Nick Thanh Phong Nguyen',
        studentNumber: '2223623',
        descripiton: "This is an API for the share a meal app."
    })
})

router.post('/api/login', userController.login)

router.post('/api/user',refreshData, validateUserCreateChaiExpect, userController.create)
router.get('/api/user',refreshData, userController.getAll)
router.get('/api/user/:userId',refreshData, userController.getById)
router.put('/api/user/:userId',refreshData, validateUserCreateChaiExpect, userController.update)
router.delete('/api/user/:userId',refreshData, userController.delete)

//========================================
router.post('/api/meal',refreshData, mealController.create)
router.get('/api/meal',refreshData, mealController.getAll)
router.get('/api/meal/:mealId',refreshData, mealController.getById)
router.put('/api/meal/:mealId',refreshData, mealController.update)
router.delete('/api/meal/:mealId',refreshData, mealController.delete)

module.exports = router
