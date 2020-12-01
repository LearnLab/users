const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
    console.log('Connected to the DB');
});

/**
 * Create Tables
 */
const createTables = () => {
    const queryText =
        `CREATE TABLE IF NOT EXISTS users (
            username VARCHAR(32) PRIMARY KEY,
            name VARCHAR(42) NOT NULL,
            email VARCHAR(42) NOT NULL,
            city VARCHAR(42) NULL,
            country VARCHAR(42) NULL,
            cellphone VARCHAR(14) NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            last_sign_in TIMESTAMP NOT NULL
        )`;

    pool.query(queryText).then((res) => {
        console.log(res);
        pool.end();
    }).catch((err) => {
        console.log(err);
        pool.end();
    });
};

module.exports = {
    createTables
};

require('make-runnable');
