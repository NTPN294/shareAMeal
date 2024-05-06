let database = {
    _data: [
        {
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
        }
    ],

    _index: 2,
    _delayTime: 250,

    getAll(callback) {
        setTimeout(() => {
            callback(null, this._data);
        }, this._delayTime);
    },

    getById(id, callback) {
        setTimeout(() => {
            const user = this._data.find(user => user.id === id);
            callback(null, user);
        }, this._delayTime);
    },


    add(item, callback) {
        const oldUser = this._data.find(user => user.emailAddress === item.emailAddress);
        if (oldUser) {
            const error = new Error(`User with email ${item.emailAddress} already exists`);
            error.status = 403; // Set the status code to 400 for Bad Request
            callback(error, null);
            return;
        }

        setTimeout(() => {
            item = {
                id: this._index++,
                ...item
            }
            this._data.push(item);
            callback(null, item);
        }, this._delayTime);
    },

    delete(id, callback) {
        setTimeout(() => {
            const index = this._data.findIndex(user => user.id === id);
            if (index !== -1) {
                const deletedUser = this._data.splice(index, 1)[0]; // Remove the user at the found index
                callback(null, deletedUser);
            } else {
                const error = new Error(`User with id ${id} not found`);
                error.status = 404; // Set the status code to 400 for Bad Request
                callback(error, null);
            }
        }, this._delayTime);
    },

    update(id, updatedFields, callback) {
        setTimeout(() => {
            const userIndex = this._data.findIndex(user => user.id === id);

            if (userIndex === -1) {
                const error = new Error(`User with id ${id} not found`);
                error.status = 404; // Not Found
                callback(error, null);
                return;
            }

            const currentUser = this._data[userIndex];
            const existingUserWithUpdatedEmail = this._data.find(user => user.emailAddress === updatedFields.emailAddress);

            if (existingUserWithUpdatedEmail && existingUserWithUpdatedEmail.id !== currentUser.id) {
                const error = new Error(`Other user with email ${updatedFields.emailAddress} already exists`);
                error.status = 403; // Forbidden
                callback(error, null);
                return;
            }

            const updatedUser = { ...this._data[userIndex], ...updatedFields };
            this._data[userIndex] = updatedUser;
            callback(null, updatedUser);
        }, this._delayTime);
    }


};

module.exports = database;
