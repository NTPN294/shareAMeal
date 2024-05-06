const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const logger = require('../util/logger')

//functions =========================================
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

// Tijdelijke functie om niet bestaande routes op te vangen =======================
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}

// Input validation functions for user routes
const validateUserCreate = (req, res, next) => {
    let newUser = req.body
    if (!newUser.firstName || !newUser.lastName || !newUser.password || !newUser.emailAddress || !newUser.phoneNumber || !newUser.street || !newUser.city || !newUser.isActive) {
        next({
            status: 400,
            message: "Missing required fields",
            requiredFields: ["firstName", "lastName", "password", "emailAddress", "phoneNumber", "street", "city", "isActive"],
            data: {}
        })
    }
    next()
}

// Input validation function 2 met gebruik van assert
const validateUserCreateAssert = (req, res, next) => {
    const { firstName, lastName, password, emailAddress, phoneNumber, street, city, isActive } = req.body;

    try {
        assert(firstName, 'Missing or incorrect first name');
        assert(lastName, 'Missing last name');

        // Check password
        if (!password) {
            throw new Error('Password is missing');
        } else if (!isValidPassword(password)) {
            throw new Error('Invalid password: Password must contain at least 8 characters, including at least 1 uppercase letter and 1 digit');
        }

        // Check email address
        if (!emailAddress) {
            throw new Error('Email address is missing');
        } else if (!isValidEmailAddress(emailAddress)) {
            throw new Error('Invalid email address: j.doe@company.com format expected');
        }

        // Check phone number
        if (!phoneNumber) {
            throw new Error('Phone number is missing');
        } else if (!isValidPhoneNumber(phoneNumber)) {
            throw new Error('Invalid phone number: Phone number must be in the format 0612345678');
        }

        assert(street, 'Missing street');
        assert(city, 'Missing city');
        assert(typeof isActive === 'boolean', 'isActive must be a boolean');

        next(); // If all assertions pass, move to the next middleware
    } catch (error) {
        res.status(400).json({
            message: error.message,
            data: {}
        });
    }
}

// Input validation function 2 met gebruik van assert
const validateUserCreateChaiShould = (req, res, next) => {
    try {
        // Assert that all required fields exist and are of correct types
        req.body.firstName.should.not.be.empty.and.be.a('string');
        req.body.lastName.should.not.be.empty.and.be.a('string');
        req.body.password.should.not.be.empty.and.be.a('string'); // Password must be at least 8 characters long
        req.body.emailAddress.should.not.be.empty.and.be.a('string'); // Basic email format validation
        req.body.phoneNumber.should.not.be.empty.and.be.a('string'); // Phone number format validation
        req.body.street.should.not.be.empty.and.be.a('string');
        req.body.city.should.not.be.empty.and.be.a('string');
        req.body.isActive.should.be.a('boolean');

        // Additional validations
        if (!isValidPassword(req.body.password)) {
            throw new Error('Invalid password: Password must contain at least 8 characters, including at least 1 uppercase letter and 1 digit');
        }
        if (!isValidEmailAddress(req.body.emailAddress)) {
            throw new Error('Invalid email address: j.doe@company.com format expected');
        }
        if (!isValidPhoneNumber(req.body.phoneNumber)) {
            throw new Error('Invalid phone number: Phone number must be in the format 0612345678');
        }s
        next();
    } catch (ex) {
        // Handle validation errors and pass them to the error handler middleware
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
}

const validateUserCreateChaiExpect = (req, res, next) => {
    try {
        // Assert that all required fields exist and are of correct types
        chai.expect(req.body.firstName, 'Missing or incorrect firstName field').to.be.a('string').and.not.empty;
        chai.expect(req.body.lastName, 'Missing or incorrect lastName field').to.be.a('string').and.not.empty;
        chai.expect(req.body.password, 'Missing or incorrect password field').to.be.a('string').and.not.empty;
        chai.expect(req.body.emailAddress, 'Missing or incorrect emailAddress field').to.be.a('string').and.not.empty;
        chai.expect(req.body.phoneNumber, 'Missing or incorrect phoneNumber field').to.be.a('string').and.not.empty;
        chai.expect(req.body.street, 'Missing or incorrect street field').to.be.a('string').and.not.empty;
        chai.expect(req.body.city, 'Missing or incorrect city field').to.be.a('string').and.not.empty;
        chai.expect(req.body.isActive, 'Missing or incorrect isActive field').to.be.a('boolean');

        // Additional validations
        if (!isValidPassword(req.body.password)) {
            throw new Error('Invalid password: Password must contain at least 8 characters, including at least 1 uppercase letter and 1 digit');
        }
        if (!isValidEmailAddress(req.body.emailAddress)) {
            throw new Error('Invalid email address: j.doe@company.com format expected');
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




// Userroutes
router.post('/api/user', validateUserCreateChaiExpect, userController.create)
router.get('/api/user', userController.getAll)
router.get('/api/user/:userId', userController.getById)

router.put('/api/user/:userId', validateUserCreateChaiExpect, userController.update)
router.delete('/api/user/:userId', userController.delete)

module.exports = router
