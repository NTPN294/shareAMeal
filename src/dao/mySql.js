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
              emailAddress: row.emailAdress,
              password: row.password,
              phoneNumber: row.phoneNumber,
              roles: row.roles,
              street: row.street,
              city: row.city,
          }));

          // Replace the existing data in the database object with retrieved users
          database2._data = users;
          
          // Invoke the callback with the updated database data
          callback(null, database2._data);
      });
  });
}

module.exports = {getUsers};


