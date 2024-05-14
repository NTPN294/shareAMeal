let database = {
    _data: [{
        users: [{}],
        meals: [{}],
        mealParticipants: [{}] 
    }],
    _delayTime: 250,

    getAllUser(callback) {
        setTimeout(() => {
            callback(null, this._data.users);
        }, this._delayTime);
    },

    getByIdUser(id, callback) {
        setTimeout(() => {
            const user = this._data.users.find(user => user.id === id);
            callback(null, user);
        }, this._delayTime);
    },


    addUser(item, callback) {
        const oldUser = this._data.users.find(user => user.emailAdress === item.emailAdress);
        if (oldUser) {
            const error = new Error(`User with email ${item.emailAdress} already exists`);
            error.status = 403; // Set the status code to 400 for Bad Request
            callback(error, null);
            return;
        }

        setTimeout(() => {
            item = {
                id: this._data.users[this._data.users.length - 1].id + 1,
                ...item
            }
            this._data.users.push(item);
            callback(null, item);
        }, this._delayTime);
    },

    deleteUser(id, callback) {
        setTimeout(() => {
            const index = this._data.users.findIndex(user => user.id === id);
            if (index !== -1) {
                const deletedUser = this._data.users.splice(index, 1)[0]; // Remove the user at the found index
                callback(null, deletedUser);
            } else {
                const error = new Error(`User with id ${id} not found`);
                error.status = 404; // Set the status code to 400 for Bad Request
                callback(error, null);
            }
        }, this._delayTime);
    },

    updateUser(id, updatedFields, callback) {
        setTimeout(() => {
            const userIndex = this._data.users.findIndex(user => user.id === id);

            if (userIndex === -1) {
                const error = new Error(`User with id ${id} not found`);
                error.status = 404; // Not Found
                callback(error, null);
                return;
            }

            const currentUser = this._data.users[userIndex];
            const existingUserWithUpdatedEmail = this._data.users.find(user => user.emailAdress === updatedFields.emailAdress);

            if (existingUserWithUpdatedEmail && existingUserWithUpdatedEmail.id !== currentUser.id) {
                const error = new Error(`Other user with email ${updatedFields.emailAdress} already exists`);
                error.status = 403; // Forbidden
                callback(error, null);
                return;
            }

            const updatedUser = { ...this._data.users[userIndex], ...updatedFields };
            this._data.users[userIndex] = updatedUser;
            callback(null, updatedUser);
        }, this._delayTime);
    },

    getByEmailUser(emailAdress, callback) {
        setTimeout(() => {
            const user = this._data.users.find(user => user.emailAdress === emailAdress);
            callback(null, user);
        }, this._delayTime);
    },

    //=========================================================================================================
    //meals
    getAllMeals(callback) {
        setTimeout(() => {
            callback(null, this._data.meals);
        }, this._delayTime);
    },

    getByIdMeal(id, callback) {
        setTimeout(() => {
            const meal = this._data.meals.find(meal => meal.id === id);
            callback(null, meal);
        }, this._delayTime);
    },

    addMeal(item, callback) {
        setTimeout(() => {
            item = {
                id: this._data.meals[this._data.meals.length - 1].id + 1,
                ...item
            }
            this._data.meals.push(item);
            callback(null, item);
        }, this._delayTime);
    },

    updateMeal(id, updatedFields, callback) {
        setTimeout(() => {

            const mealIndex = this._data.meals.findIndex(meal => meal.id === id);
            
            if (mealIndex === -1) {
                const error = new Error(`Meal with id ${id} not found`);
                error.status = 404; // Not Found
                callback(error, null);
                return;
            }

            const updatedMeal = { ...this._data.meals[mealIndex], ...updatedFields };
            this._data.meals[mealIndex] = updatedMeal;
            callback(null, updatedMeal);
        }, this._delayTime);
    },

    deleteMeal(id, callback) {
        setTimeout(() => {
            const index = this._data.meals.findIndex(meal => meal.id === id);
            if (index !== -1) {
                const deletedMeal = this._data.meals.splice(index, 1)[0]; // Remove the meal at the found index
                callback(null, deletedMeal);
            } else {
                const error = new Error(`Meal with id ${id} not found`);
                error.status = 404; // Set the status code to 400 for Bad Request
                callback(error, null);
            }
        }, this._delayTime);
    },

    login(emailAdress, password, callback){
        setTimeout(() => {
            if (emailAdress === undefined || password === undefined) {
                const error = new Error('[emailAdress], [password] are required');
                error.status = 400; // Bad Request
                callback(error, null);
                return;
            }

            const user = this._data.users.find(user => user.emailAdress === emailAdress);
            if (!user) {
                const error = new Error('User not found');
                error.status = 404; // Not Found
                callback(error, null);
                return;
            }

            if (user.password !== password) {
                const error = new Error('Invalid password');
                error.status = 400;
                callback(error, null);
                return;
            }

            callback(null, user);
        }, this._delayTime);
    }



};


module.exports = database;
