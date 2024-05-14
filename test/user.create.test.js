const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const mysql = require('../src/dao/mySql')


chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

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

//===========================
// uc-201
describe('UC-101 inloggen', () => {
    it('TC-101-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                emailAdress: "v.achterNieuw@example.com"
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Missing or incorrect password field: expected undefined to be a string')
                done()
            })
    })

    it('TC-101-2 niet valide wachtwoord', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                emailAdress: "v.achterNieuw@example.com",
                password: "notThePassword"
            }).end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Invalid password: Password must contain at least 8 characters, including at least 1 uppercase letter and 1 digit')
                done()
            })
    })

    it('TC-101-3 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                emailAdress: "a.blabla@bestaat.nl",
                password: "Passw0rd2"
            }).end((err, res) => {
                res.should.have.status(404)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('User not found')
                done()
            })
    })

    it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({
                emailAdress: "v.achterNieuw@example.com",
                password: "Passw0rd2"
            }).end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('User logged in with id 1.')
                done()
            })
    })
})

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
            .post("/api/user")
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
            .post("/api/user")
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
            .post("/api/user")
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
            .post("/api/user")
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
            .post("/api/user")
            .send({
                firstName: "Voornaam",
                lastName: "Achternaam",
                isActive: true,
                emailAdress: "v.achter@ex" + generateRandomLetters(8) + ".com",
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
            .get("/api/user")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('data').property("users").that.is.a('array').and.not.empty

                done()
            })
    })

    it('TC-202-3 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=false', (done) => {
        chai.request(server)
            .get("/api/user")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('data').property('inActiveUsers').that.is.a('array').and.not.empty
                done()
            })
    })

    it('TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld ‘isActive’=true', (done) => {
        chai.request(server)
            .get("/api/user")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('data').property('activeUsers').that.is.a('array').and.not.empty
                done()
            })


    })

})
//======================== uc-203
describe('UC-203 opvragen van gebruikers profiel', () => {
    it('TC-203-1 Ongeldig token', (done) => {
        chai.request(server)
            .get("/api/user/profile")
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.have.property('error').equals('Unauthorized: Missing token')
                done()
            })
    })

    it('TC-203-2 Gebruiker ingelogd met geldig token', (done) => {
        chai.request(server)
            .get("/api/user/profile")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals(`Found user with id 1`)
                done()
            })
    })
})

//======================== uc-204 Opvragen van usergegevens bij ID
describe('UC-204 Opvragen van usergegevens bij ID', () => {

    it('TC-204-1 Ongeldig token', (done) => {
        chai.request(server)
            .get("/api/user/1")
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.have.property('error').equals('Unauthorized: Missing token')
                done()
            })
    })

    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
        chai.request(server)
            .get("/api/user/999")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('User with id 999 not found')

                done()
            })
    })

    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
        chai.request(server)
            .get("/api/user/1")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
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
            .put("/api/user/1")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
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

    it('TC-205-2 De Gebruiker is niet de eigenaar van de date', (done) => {
        chai.request(server)
            .put("/api/user/2")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .send({
                firstName: "Voornaam2",
                lastName: "Achternaam2",
                password: "Passw0rd2",
                emailAdress: "v.achterNieuws@example.com",
                phoneNumber: "0612345678",
                street: "123 Main St2",
                city: "Cityville2",
                isActive: true
            }).end((err, res) => {
                res.should.have.status(403)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Forbidden: You are not allowed to update this user')

                done()
            })
    })

    it('TC-205-3 Niet-valide telefoonnummer', (done) => {
        chai.request(server)
            .put("/api/user/1")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
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
            .put("/api/user/999")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
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
                res.should.have.status(403)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Forbidden: You are not allowed to update this user')

                done()
            })
    })

    it('TC-205-5 Niet ingelogd', (done) => {
        chai.request(server)
            .put("/api/user/1")
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
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have.property('error').equals('Unauthorized: Missing token')

                done()
            })
    })

    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
        chai.request(server)
            .put("/api/user/1")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
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
            .delete("/api/user/999")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(403)
                res.body.should.have.property('message').equals('Forbidden: You are not allowed to delete this user')

                done()
            })
    })

    it('TC-206-2 Niet ingelogd', (done) => {
        chai.request(server)
            .delete("/api/user/1")
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have.property('error').equals('Unauthorized: Missing token')

                done()
            })
    })

    it('TC-206-3 De Gebruiker is niet de eigenaar van de date', (done) => {
        chai.request(server)
            .delete("/api/user/2")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(403)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Forbidden: You are not allowed to delete this user')

                done()
            })

        it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
            chai.request(server)
                .delete("/api/user/1")
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.a('object')
                    res.body.should.have.property('message').equals('User with id 1 deleted.')

                    done()
                })
        })

    })

})

//==========================
//UC-301 Toevoegen van maaltijd
describe('UC-301 Toevoegen van maaltijd', () => {
    it('TC-301-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post("/api/meal")
            .send({
                // name: 'Maaltijd', ontbreekt
                description: 'Beschrijving',
                price: 12.50,
                isActive: true
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('missing or incorrect name field: expected undefined to be a string')
                done()
            })
    })

    it('TC-301-2 Niet ingelogd', (done) => {
        chai.request(server)
            .post("/api/meal")
            .send({
                name: "Delicious Pastaaaaaaaaaaaaaaaaaaa",
                description: "A mouth-watering pasta dish",
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: "2024-05-14T18:36:51.000Z",
                maxAmountOfParticipants: 4,
                price: 12.99,
                imageUrl: "https://example.com/pasta.jpg",
                cookId: 1,
                createDate: "2022-02-26T17:12:40.048Z",
                allergenes: "gluten",
                updateDate: "2024-05-14T18:36:51.455Z"
            })
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have.property('error').equals('Unauthorized: Missing token')
                done()
            })
    })

    it('TC-301-3 Succesvol maaltijd toegevoegd', (done) => {
        chai.request(server)
            .post("/api/meal")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .send({
                name: "Delicious Pastaaaaaaaaaaaaaaaaaaa",
                description: "A mouth-watering pasta dish",
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: "2024-05-14T18:36:51.000Z",
                maxAmountOfParticipants: 4,
                price: 12.99,
                imageUrl: "https://example.com/pasta.jpg",
                cookId: 1,
                createDate: "2022-02-26T17:12:40.048Z",
                allergenes: "gluten",
                updateDate: "2024-05-14T18:36:51.455Z"
            })
            .end((err, res) => {
                res.should.have.status(201)
                res.body.should.be.a('object')
                res.body.should.have.property('message')
                done()
            })
    })

})

describe('UC-302 wijzigen van maaltijdsgegevens', () => {
    it('TC-302-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .put("/api/meal/1")
            .send({
                // name: 'Maaltijd', ontbreekt
                description: 'Beschrijving',
                price: 12.50,
                isActive: true
            })
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('missing or incorrect name field: expected undefined to be a string')
                done()
            })
    })

    it('TC-302-2 Niet ingelogd', (done) => {
        chai.request(server)
            .put("/api/meal/1")
            .send({
                name: "Delicious Pastaaaaaaaaaaaaaaaaaaa",
                description: "A mouth-watering pasta dish",
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: "2024-05-14T18:36:51.000Z",
                maxAmountOfParticipants: 4,
                price: 12.99,
                imageUrl: "https://example.com/pasta.jpg",
                cookId: 1,
                createDate: "2022-02-26T17:12:40.048Z",
                allergenes: "gluten",
                updateDate: "2024-05-14T18:36:51.455Z"
            })
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have.property('error').equals('Unauthorized: Missing token')
                done()
            })
    })

    it('TC-302-3 Niet de eigenaar van de data', (done) => {
        chai.request(server)
            .put("/api/meal/5")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .send({
                name: "Delicious Pastaaaaaaaaaaaaaaaaaaa",
                description: "A mouth-watering pasta dish",
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: "2024-05-14T18:36:51.000Z",
                maxAmountOfParticipants: 4,
                price: 12.99,
                imageUrl: "https://example.com/pasta.jpg",
                cookId: 1,
                createDate: "2022-02-26T17:12:40.048Z",
                allergenes: "gluten",
                updateDate: "2024-05-14T18:36:51.455Z"
            })
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.be.a('object')
                res.body.should.have.property('error').equals('Unauthorized: Not the cook of this meal')
                done()
            })
    })

    it('TC-302-4 Maaltijd bestaat niet', (done) => {
        chai.request(server)
            .put("/api/meal/666")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .send({
                name: "Delicious Pastaaaaaaaaaaaaaaaaaaa",
                description: "A mouth-watering pasta dish",
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: "2024-05-14T18:36:51.000Z",
                maxAmountOfParticipants: 4,
                price: 12.99,
                imageUrl: "https://example.com/pasta.jpg",
                createDate: "2022-02-26T17:12:40.048Z",
                allergenes: "gluten",
                updateDate: "2024-05-14T18:36:51.455Z"
            })
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Meal with id 666 not found')
                done()
            })
    })

    it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
        chai.request(server)
            .put("/api/meal/1")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .send({
                name: "Delicious Pastaaaaaaaaaaaaaaaaaaa",
                description: "A mouth-watering pasta dish",
                isActive: true,
                isVega: false,
                isVegan: false,
                isToTakeHome: true,
                dateTime: "2024-05-14T18:36:51.000Z",
                maxAmountOfParticipants: 4,
                price: 12.99,
                imageUrl: "https://example.com/pasta.jpg",
                createDate: "2022-02-26T17:12:40.048Z",
                allergenes: "gluten",
                updateDate: "2024-05-14T18:36:51.455Z"
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')
                res.body.should.have.property('message').equals('Updated meal with id 1.')
                done()
            })

    })

})


describe("UC-303 Maaltijd retourneren", () => {
    it('TC-303-1 Lijst geretourneerd', (done) => {
        chai.request(server)
            .get("/api/meal")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('message')

                done()
            })
    })
})

describe('TC-304 Opvragen van maaltijd bij id', () => {
    it('TC-304-1 Maaltijd bestaat niet', (done) => {
        chai.request(server)
            .get("/api/meal/999")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.have.property('message').equals('Meal with id 999 not found')

                done()
            })
    })

    it('TC-304-2 maaltijd geretourneerd', (done) => {
        chai.request(server)
            .get("/api/meal/1")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('message').equals('Found meal with id 1.')

                done()
            })
    })
})

describe('TC-305 verwijderen van maaltijd', () => {
    it('TC-305-1 niet ingelogd', (done) => {
        chai.request(server)
            .delete("/api/meal/999")
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.have.property('error').equals('Unauthorized: Missing token')

                done()
            })
    })

    it('TC-305-2 Niet de eigenaar van de data', (done) => {
        chai.request(server)
        .delete("/api/meal/5")
        .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
        .end((err, res) => {
            res.should.have.status(401)
            res.body.should.have.property('error').equals('Unauthorized: Not the cook of this meal')

            done()
        })
    })

    it('TC-305-3 Maaltijd bestaat niet', (done) => {
        chai.request(server)
            .delete("/api/meal/999")
            .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
            .end((err, res) => {
                res.should.have.status(404)
                res.body.should.have.property('message').equals('Meal with id 999 not found')

                done()
            })
    })

    //uc maaltijd verwijderen verwijdert uit mijn db ): 

})

describe('UC-401 Aanmelden maaltijd', () => {
    it('TC-401-1 niet ingelogd', (done) => {
        chai.request(server)
            .post("/api/meal/1/participate")
            .end((err, res) => {
                res.should.have.status(401)
                res.body.should.have.property('error').equals('Unauthorized: Missing token')

                done()
            })
        
    })

    it('TC-401-2 Maaltijd bestaat niet', (done) => {
        chai.request(server)
        .post("/api/meal/999/participate")
        .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
        .end((err, res) => {
            res.should.have.status(404)
            res.body.should.have.property('message').equals('Meal with id 999 not found')

            done()
        })
    })

    it.skip('TC-401-3 succesvol aangemeld', (done) => {

        chai.request(server)
        .post("/api/meal/5/participate")
        .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
        .set('id', 1)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('message').equals('MealParticipant created with id 1 to meal 5.')

            done()
        })
    })

    it('TC-401-4 maximum aanmeldingen', (done) => {
        chai.request(server)
        .post("/api/meal/1/participate")
        .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
        .set('id', 1)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('message').equals('Meal with id 1 is full')

            done()
        })
    })
})

describe("UC-402 Afmelden maaltijd", () => {
    it('TC-402-1 niet ingelogd', (done) => {
        chai.request(server)
        .delete("/api/meal/1/participate")
        .end((err, res) => {
            res.should.have.status(401)
            res.body.should.have.property('error').equals('Unauthorized: Missing token')

            done()
        })
    })

    it('TC-402-2 maaltijd bestaat niet', (done) => {
        chai.request(server)
        .delete("/api/meal/999/participate")
        .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
        .end((err, res) => {
            res.should.have.status(401)
            res.body.should.have.property('error').equals('Unauthorized: Not a participant of this meal')

            done()
        })
    })

    it('TC-403-3 aanmelding bestaat niet', (done) => {
        chai.request(server)
        .delete("/api/meal/999/participate")
        .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
        .end((err, res) => {
            res.should.have.status(401)
            res.body.should.have.property('error').equals('Unauthorized: Not a participant of this meal')

            done()
        })
    })

    it.skip('TC-402-4 succesvol afgemeld', (done) => {
        chai.request(server)
        .delete("/api/meal/5/participate")
        .set('Authorization', 'Bearer ' + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoxLCJmaXJzdE5hbWUiOiJWb29ybmFhbTIiLCJsYXN0TmFtZSI6IkFjaHRlcm5hYW0yIiwiaXNBY3RpdmUiOjEsImVtYWlsQWRyZXNzIjoidi5hY2h0ZXJOaWV1d0BleGFtcGxlLmNvbSIsInBhc3N3b3JkIjoiUGFzc3cwcmQyIiwicGhvbmVOdW1iZXIiOiIwNjEyMzQ1Njc4Iiwicm9sZXMiOiIiLCJzdHJlZXQiOiIxMjMgTWFpbiBTdDIiLCJjaXR5IjoiQ2l0eXZpbGxlMiJ9LCJpYXQiOjE3MTU3MTQzMTksImV4cCI6MTcxNTcyMTUxOX0.4NDMKRPabjRf9Wa0qYq_P-_gvzx8JVMhXq8JwLN5f0E")
       .set("id", 1)
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.have.property('message').equals('MealParticipant deleted with id 1 from meal 5.')

            done()
        })
    })
})