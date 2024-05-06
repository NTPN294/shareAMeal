const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

describe("UC-201: Create a new user", () => {

    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    it("TC-201-1 Verplicht veld ontbreekt", (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'John',
                lastName: 'Test',
                password: 'Passw0rd',
                emailAddress: 'j.test@example.com'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(201)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body).to.have.property('message').equal('Missing required field')
                done()
            })
    })

    it('TC-201-2 Niet-valide email adres', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'John',
                lastName: 'Test',
                password: 'Passw0rd',
                emailAddress: 'j.test@example',
                phoneNumber: '0612345678',
                street: '123 Main St',
                city: 'Cityville',
                isActive: true
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(201)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body).to.have.property('message').equal("Invalid email address: Email address must be in the format 'n.lastname@domain.com' where: - 'n' is a single letter, - 'lastname' consists of at least two letters, - 'domain' consists of at least two letters, - 'domain extension' (e.g., 'com') contains 2 or 3 letters.")
                done()
            })
        done()
    })

    it('TC-201-3 Niet-valide password', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'John',
                lastName: 'Test',
                password: 'password',
                emailAddress: 'j.test@example.com',
                phoneNumber: '0612345678',
                street: '123 Main St',
                city: 'Cityville',
                isActive: true
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(201)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body).to.have.property('message').equal("Invalid password: Password must contain at least 8 characters, including at least 1 uppercase letter and 1 digit.")
                done()
            })
        done()
    })

    it('TC-201-4 gebruiker bestaat al', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'John',
                lastName: 'Doe',
                password: 'Passw0rd',
                emailAddress: 'j.doe@example.com',
                phoneNumber: '0612345678',
                street: '123 Main St',
                city: 'Cityville',
                isActive: true
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res).not.to.have.status(201)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body).to.have.property('message').equal("User already exists")
                done()
            })
        done()
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'John',
                lastName: 'Test',
                password: 'Passw0rd',
                emailAddress: 'j.test@example.com',
                phoneNumber: '0612345678',
                street: '123 Main St',
                city: 'Cityville',
                isActive: true
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res).not.to.have.status(201)
                chai.expect(res.body).to.be.an('object')
                chai.expect(res.body).to.have.property('message').equal("User already exists")
                done()
            })
        done()
    })
})
