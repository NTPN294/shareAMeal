const mysql = require('mysql');
const logger = require('../util/logger');
const database2 = require('../dao/inmem-db');


const host = process.env.DB_HOST || "db-mysql-ams3-46626-do-user-8155278-0.b.db.ondigitalocean.com";
const port = process.env.DB_PORT || 25060;
const user = process.env.DB_USER || 2223623;
const database = process.env.DB_DATABASE || 2223623;
const password = process.env.DB_PASSWORD || "secret";

// Maak een MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host,
  port,
  user,
  password,
  database
});


function getUsers(callback) {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      logger.error('Error connecting to MySQL:', err);
      callback(err);
      return;
    }
    logger.info('Connected to MySQL as ID:', connection.threadId);

    // Execute a SELECT query to retrieve data from a table
    const query = 'SELECT * FROM user';
    connection.query(query, (err, results) => {
      // Release the connection back to the pool
      connection.release();

      if (err) {
        logger.error('Error executing MySQL query:', err);
        callback(err);
        return;
      }

      // Map MySQL results to the format expected by the database object
      const users = results.map((row) => ({
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        isActive: row.isActive,
        emailAdress: row.emailAdress,
        password: row.password,
        phoneNumber: row.phoneNumber,
        roles: row.roles,
        street: row.street,
        city: row.city,
      }));

      // Replace the existing data in the database object with retrieved users
      database2._data.users = users;

      // Invoke the callback with the updated database data
      callback(null, database2._data.users);
    });
  });
}

function addUser(user) {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      logger.error('Error connecting to MySQL:', err);
      return;
    }
    logger.info('Connected to MySQL as ID:', connection.threadId);

    const query = 'INSERT INTO user (firstName, lastName,isActive,emailAdress, password, phoneNumber, street, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
      user.firstName,
      user.lastName,
      user.isActive,
      user.emailAdress,
      user.password,
      user.phoneNumber,
      user.street,
      user.city
    ];
    // Execute the SQL query
    connection.query(query, values, (err, results) => {
      // Release the connection back to the pool
      connection.release();

      if (err) {
        logger.error('Error executing MySQL query:', err);
        callback(err);
        return;
      }

      // Log the inserted user data
      logger.info('User inserted successfully:', user);

    });
  });
}

function deleteUser(userId) {
  pool.getConnection((err, connection) => {
    if (err) {
      logger.error('Error connecting to MySQL:', err);
      return;
    }
    logger.info('Connected to MySQL as ID:', connection.threadId);

    const query = 'DELETE FROM user where id = ?';
    const values = [
      userId
    ];
    // Execute the SQL query
    connection.query(query, values, (err, results) => {
      // Release the connection back to the pool
      connection.release();

      if (err) {
        logger.error('Error executing MySQL query:', err);
        callback(err);
        return;
      }

      // Log the inserted user data
      logger.info('User deleted successfully:', user);

    });
  });
}

function updateUser(userId, updatedFields) {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      logger.error('Error connecting to MySQL:', err);
      return;
    }
    logger.info('Connected to MySQL as ID:', connection.threadId);

    const query = 'UPDATE user SET firstName = ?, lastName = ?, isActive = ?, emailAdress = ?, password = ?, phoneNumber = ?, street = ?, city = ? WHERE id = ?';
    const values = [
      updatedFields.firstName,
      updatedFields.lastName,
      updatedFields.isActive,
      updatedFields.emailAdress,
      updatedFields.password,
      updatedFields.phoneNumber,
      updatedFields.street,
      updatedFields.city,
      userId
    ];
    // Execute the SQL query
    connection.query(query, values, (err, results) => {
      // Release the connection back to the pool
      connection.release();

      if (err) {
        logger.error('Error executing MySQL query:', err);
        callback(err);
        return;
      }

      // Log the inserted user data
      logger.info('User updated successfully:', user);

    });
  });
}

//============================================================  
//meals
function getMeals(callback) {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      logger.error('Error connecting to MySQL:', err);
      callback(err);
      return;
    }
    logger.info('Connected to MySQL as ID:', connection.threadId);

    // Execute a SELECT query to retrieve data from a table
    const query = 'SELECT * FROM meal';
    connection.query(query, (err, results) => {
      // Release the connection back to the pool
      connection.release();

      if (err) {
        logger.error('Error executing MySQL query:', err);
        callback(err);
        return;
      }

      // Map MySQL results to the format expected by the database object
      const meals = results.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isActive: row.isActive,
        isVega: row.isVega,
        isVegan: row.isVegan,
        isToTakeHome: row.isToTakeHome,
        dateTime: row.dateTime,
        maxAmountOfParticipants: row.maxAmountOfParticipants,
        price: row.price,
        imageUrl: row.imageUrl,
        cookId: row.cookId,
        createDate: row.createDate,
        allergenes: row.allergenes,
        updateDate: row.updateDate,

      }));

      // Replace the existing data in the database object with retrieved users
      database2._data.meals = meals;

      // Invoke the callback with the updated database data
      callback(null, database2._data.meals);
    });
  });
}

function addMeal(meal){
    // Get a connection from the pool
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error connecting to MySQL:', err);
        callback(err);
        return;
      }  
      // Execute a SELECT query to retrieve data from a table
      const createDate = new Date(meal.createDate).toISOString().slice(0, 19).replace('T', ' ');

      const query = 'INSERT INTO meal (name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookID, createDate, allergenes, updateDate) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
      const values = [
        meal.name,
        meal.description,
        meal.isActive,
        meal.isVega,
        meal.isVegan,
        meal.isToTakeHome,
        new Date(meal.dateTime),
        meal.maxAmountOfParticipants,
        meal.price,
        meal.imageUrl,
        meal.cookID,
        meal.createDate,
        meal.allergenes,
        meal.updateDate
      ];
      // Execute the SQL query
      connection.query(query, values, (err, results) => {
        // Release the connection back to the pool
        connection.release();
  
        if (err) {
          logger.error('Error executing MySQL query:', err);
          callback(err);
          return;
        }
  
        // Log the inserted user data
        logger.info('Meal inserted successfully:', user);
  
      });
    });
}

function updateMeal(mealId, updatedFields){
    // Get a connection from the pool
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error connecting to MySQL:', err);
        return;
      }
      logger.info('Connected to MySQL as ID:', connection.threadId);
  
      const query = 'UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, cookID = ?, createDate = ?, allergenes = ?, updateDate = ? WHERE id = ?';
      const values = [
        updatedFields.name,
        updatedFields.description,
        updatedFields.isActive,
        updatedFields.isVega,
        updatedFields.isVegan,
        updatedFields.isToTakeHome,
        updatedFields.dateTime,
        updatedFields.maxAmountOfParticipants,
        updatedFields.price,
        updatedFields.imageUrl,
        updatedFields.cookID,
        updatedFields.createDate,
        updatedFields.allergenes,
        updatedFields.updateDate,
        mealId
      ];
      // Execute the SQL query
      connection.query(query, values, (err, results) => {
        // Release the connection back to the pool
        connection.release();
  
        if (err) {
          logger.error('Error executing MySQL query:', err);
          callback(err);
          return;
        }
  
        // Log the inserted user data
        logger.info('Meal updated successfully:', user);
  
      });
    });
}

function deleteMeal(mealId){
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error('Error connecting to MySQL:', err);
        return;
      }
      logger.info('Connected to MySQL as ID:', connection.threadId);
  
      const query = 'DELETE FROM meal where id = ?';
      const values = [
        mealId
      ];
      // Execute the SQL query
      connection.query(query, values, (err, results) => {
        // Release the connection back to the pool
        connection.release();
  
        if (err) {
          logger.error('Error executing MySQL query:', err);
          callback(err);
          return;
        }
  
        // Log the inserted user data
        logger.info('Meal deleted successfully:', user);
  
      });
    });
  }

//===============================================
module.exports = { getUsers, addUser, deleteUser,updateUser, getMeals,addMeal,updateMeal,deleteMeal };


