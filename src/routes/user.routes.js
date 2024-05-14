const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const mealController = require('../controllers/meal.controller')
const loginController = require('../controllers/login.controller')
const mealParticipantController = require('../controllers/mealParticipant.controller')

const logger = require('../util/logger')
const mySql = require('../dao/mySql')
const database = require('../dao/inmem-db')
const jwtUtil = require('../controllers/jwtUtil')


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

const validateMealCreateChaiExpect = (req, res, next) => {
    try {
        // Assert that all required fields exist and are of correct types
        chai.expect(req.body.name, "missing or incorrect name field").to.be.a('string').and.not.empty;
        chai.expect(req.body.description, "missing or incorrect description field").to.be.a('string').and.not.empty;
        chai.expect(req.body.isActive, "missing or incorrect isActive field").to.be.a('boolean');
        chai.expect(req.body.isVega, "missing or incorrect isVega field").to.be.a('boolean');
        chai.expect(req.body.isVegan, "missing or incorrect isVegan field").to.be.a('boolean');
        chai.expect(req.body.isToTakeHome, "missing or incorrect isToTakeHome field").to.be.a('boolean');
        chai.expect(req.body.maxAmountOfParticipants, "missing or incorrect maxAmountOfParticipants field").to.be.a('number');
        chai.expect(req.body.price, "missing or incorrect price field").to.be.a('number');
        chai.expect(req.body.allergenes, "missing or incorrect allergens field").to.be.a('string').and.not.empty;


        logger.trace('Meal successfully validated');
        next(); // Move to the next middleware
    } catch (error) {
        logger.trace('Meal validation failed:', error.message);
        next({
            status: 400,
            message: error.message,
            data: {}
        });
    }
}

const validateLoginChaiExpect = (req, res, next) => {
    try {
        // Assert that all required fields exist and are of correct types
        chai.expect(req.body.emailAdress, 'Missing or incorrect emailAdress field').to.be.a('string').and.not.empty;
        chai.expect(req.body.password, 'Missing or incorrect password field').to.be.a('string').and.not.empty;

        // Additional validations
        if (!isValidEmailAdress(req.body.emailAdress)) {
            throw new Error('Invalid email adress: j.doe@company.com format expected');
        }
        if (!isValidPassword(req.body.password)) {
            throw new Error('Invalid password: Password must contain at least 8 characters, including at least 1 uppercase letter and 1 digit');
        }
        next();
    }
    catch (error) {
        logger.trace('Login failed:', error.message);
        next({
            status: 400,
            message: error.message,
            data: {}
        });
    }
}


//==================================================
// Middleware to load user and meal data
const loadData = async (req, res, next) => {
    try {
        const users = await getUsers();
        const meals = await getMeals();
        const mealParticipants = await getMealParticipants();
        req.customData = { users, meals, mealParticipants }; // Attach data to request object
        next();
    } catch (error) {
        logger.error('Error refreshing data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
};

// Function to retrieve users from database 
const getUsers = () => {
    return new Promise((resolve, reject) => {
        mySql.getUsers((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

// Function to retrieve meals from database
const getMeals = () => {
    return new Promise((resolve, reject) => {
        mySql.getMeals((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

const getMealParticipants = () => {
    return new Promise((resolve, reject) => {
        mySql.getMealParticipants((err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });

}

// Userroutes
router.get("/", (req, res) => {
    res.redirect("/api/info");

})

router.get('/api/info', (req, res) => {
    res.json({
        studentName: 'Nick Thanh Phong Nguyen',
        studentNumber: '2223623',
        descripiton: "This is an API for the share a meal app."
    })
})

router.post('/api/login', loadData, validateLoginChaiExpect, loginController.login)

router.post('/api/user', loadData, validateUserCreateChaiExpect, userController.create)
router.get('/api/user', loadData, jwtUtil.authenticate, userController.getAll)
router.get('/api/user/:userId', loadData, userController.getById)
router.put('/api/user/:userId', loadData, validateUserCreateChaiExpect, userController.update)
router.delete('/api/user/:userId', loadData, userController.delete)

//========================================
router.post('/api/meal', loadData, validateMealCreateChaiExpect, mealController.create)
router.get('/api/meal', loadData, mealController.getAll)
router.get('/api/meal/:mealId', loadData, mealController.getById)
router.put('/api/meal/:mealId', loadData, validateMealCreateChaiExpect, mealController.update)
router.delete('/api/meal/:mealId', loadData, mealController.delete)

//===================================================
router.post('/api/meal/:mealId/participate', loadData, mealParticipantController.create)
router.delete('/api/meal/:mealId/participate', loadData, mealParticipantController.delete)
router.get('/api/meal/:mealId/participate', loadData, mealParticipantController.getMealParticipants)
router.get('/api/meal/:mealId/participate/:participantId', loadData, mealParticipantController.getMealParticipantsByUserId)

module.exports = router
