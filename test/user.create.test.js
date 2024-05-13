const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const mysql = require('../src/dao/mySql')


chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const apiUser = '/api/user'

//=========================================================================================================
function generateRandomLetters(length) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        randomString += letters.charAt(randomIndex);
    }

    return randomString;
}
//======================== uc-201 Registreren als nieuwe user
describe('UC201 Registreren als nieuwe user', () => {
    /**
     * Voorbeeld van een beforeEach functie.
     * Hiermee kun je code hergebruiken of initialiseren.
     */
    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    /**
     * Hier starten de testcases
     */
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(apiUser)
            .send({
                // firstName: 'Voornaam', ontbreekt
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                /**
                 * Voorbeeld uitwerking met chai.expect
                 */
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(201)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect firstName field: expected undefined to be a string')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-2 Niet-valide email adres', (done) => {
        chai.request(server)
            .post(apiUser)
            .send({
                firstName: "Voornaam",
                lastName: "Achternaam",
                password: "Passw0rd",
                emailAdress: "v.achter@example",
                phoneNumber: "0612345678",
                street: "123 Main St",
                city: "Cityville",
                isActive: true
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('status').equals(400)
                res.body.should.have.property('message').equals('Invalid email adress: j.doe@company.com format expected')
            })


        done()
    })

    it('TC-201-3 Niet-valide password', (done) => {
        chai.request(server)
            .post(apiUser)
            .send({
                firstName: "Voornaam",
                lastName: "Achternaam",
                password: "password",
                emailAdress: "v.achter@example.com",
                phoneNumber: "0612345678",
                street: "123 Main St",
                city: "Cityville",
                isActive: true
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('status').equals(400)
                res.body.should.have.property('message').equals('Invalid password: Password must contain at least 8 characters, including at least 1 uppercase letter and 1 digit')
            })


        done()
    })

    it('TC-201-4 Gebruiker bestaat al', (done) => {

        chai.request(server)
            .post(apiUser)
            .send({
                firstName: "Voornaam",
                lastName: "Achternaam",
                isActive: true,
                emailAdress: "j.doe@server.com",
                password: "Passw0rd",
                phoneNumber: "0612345678",
                street: "123 Main St",
                city: "Cityville"
            })
            .end((err, res) => {
                // Check the response for the duplicate email scenario
                res.should.have.status(403) // Expect a 403 status for user already exists
                res.body.should.be.a('object')
                res.body.should.have.property('status').equals(403)
                res.body.should.have.property('message').equals(`User with email j.doe@server.com already exists`)
                done()

            })
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post(apiUser)
            .send({
                firstName: "Voornaam",
                lastName: "Achternaam",
                isActive: true,
                emailAdress: "v.achter@ex" + generateRandomLetters(8) +".com",
                password: "Passw0rd",
                phoneNumber: "0612345678",
                street: "123 Main St",
                city: "Cityville"
            })
            .end((err, res) => {
                res.should.have.status(201)
                res.body.should.be.a('object')
                res.body.should.have.property('data').that.is.a('object')
                done()
            })
    })



})

//======================== uc-202 Opvragen van overzicht van users
describe('UC-202 Opvragen van overzicht van users', () => {
    it('TC-202-1 Toon alle gebruikers (minimaal 2)', (done) => {
        chai.request(server)
            .get(apiUser)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('data').property("users").that.is.a('array').and.not.empty

                done()
            })
    })

    it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', (done) => {
        chai.request(server)
            .get(apiUser)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('data').property('inActiveUsers').that.is.a('array').and.not.empty
                done()
            })
    })

    it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', (done) => {
        chai.request(server)
            .get(apiUser)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('data').property('activeUsers').that.is.a('array').and.not.empty
                done()
            })


    })

})

//======================== uc-204 Opvragen van usergegevens bij ID
describe('UC-204 Opvragen van usergegevens bij ID', () => {

    it('TC-204-1 Ongeldig token', (done) => {
        chai.request(server)
            .get(apiUser + "/a")
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Invalid id')

                done()
            })
    })

    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
        chai.request(server)
            .get(apiUser + "/999")
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('User with id 999 not found')

                done()
            })
    })

    it('TC-204-2 Gebruiker-ID bestaat', (done) => {
        chai.request(server)
            .get(apiUser + "/1")
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Found user with id 1')

                done()
            })
    })

})

//======================== uc-205 Updaten van usergegevens
describe('UC-205 Updaten van usergegevens', () => {
    it('TC-205-1 Verplicht veld “emailAdress” ontbreekt', (done) => {
        chai.request(server)
            .put(apiUser + "/1")
            .send({
                firstName: "Voornaam2",
                lastName: "Achternaam2",
                password: "Passw0rd2",
                phoneNumber: "0612345678",
                street: "123 Main St2",
                city: "Cityville2",
                isActive: true
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Missing or incorrect emailAdress field: expected undefined to be a string')

                done()
            })
    })

    it('TC-205-3 Niet-valide telefoonnummer', (done) => {
        chai.request(server)
            .put(apiUser + "/1")
            .send({
                firstName: "Voornaam2",
                lastName: "Achternaam2",
                password: "Passw0rd2",
                emailAdress: "v.achter@example.com",
                phoneNumber: "06123",
                street: "123 Main St2",
                city: "Cityville2",
                isActive: true
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Invalid phone number: Phone number must be in the format 0612345678')

                done()
            })
    })

    it('TC-205-4 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .put(apiUser + "/999")
            .send({
                firstName: "Voornaam2",
                lastName: "Achternaam2",
                password: "Passw0rd2",
                emailAdress: "v.achter@example.com",
                phoneNumber: "0612345678",
                street: "123 Main St2",
                city: "Cityville2",
                isActive: true
            })
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('User with id 999 not found')

                done()
            })
    })

    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
        chai.request(server)
            .put(apiUser + "/1")
            .send({
                firstName: "Voornaam2",
                lastName: "Achternaam2",
                password: "Passw0rd2",
                emailAdress: "v.achterNieuw@example.com",
                phoneNumber: "0612345678",
                street: "123 Main St2",
                city: "Cityville2",
                isActive: true
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('User with id 1 updated.')

                done()
            })
    })

})

//======================== uc-206 Verwijderen van user
describe('UC-206 Verwijderen van user', () => {
    it('TC-206-1 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .delete(apiUser + "/999")
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('User with id 999 not found')

                done()
            })
    })

    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
        chai.request(server)
            .delete(apiUser + "/1")
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('User with id 1 deleted.')

                done()
            })
    })
})
