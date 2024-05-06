let database = [{
    _data: [{
        id: 0,
        firstName: 'John',
        lastName: 'Doe',
        password: 'Passw0rd',
        emailAddress: 'j.doe@example.com',
        phoneNumber: '0612345678',
        street: '123 Main St',
        city: 'Cityville',
        isActive: true
    },
    {
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'Secret123',
        emailAddress: 'j.smith@example.com',
        phoneNumber: '0612345679',
        street: '456 Elm St',
        city: 'Townsville',
        isActive: false
    }],

    _index: 2,
    _delayTime: 500,

    getAll(callback) {
        setTimeout(() => {
            callback(null, this._data)
        }, this._delayTime)
    },

    getById(id, callback) {
        setTimeout(() => {
            const user = this._data.find(user => user.id === id)
            callback(null, user)
        }, this._delayTime)
    },

    add(item, callback) {
        setTimeout(() => {
            item.id = this._index++
            this._data.push(item)
            callback(null, item)
        }, this._delayTime)
    }

    
}]




module.exports = database;
