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
            hash CHAR(60) NOT NULL,
            email VARCHAR(42) NOT NULL UNIQUE,
            validated BOOLEAN DEFAULT FALSE,
            name VARCHAR(42) NOT NULL,
            city VARCHAR(42) NULL,
            country VARCHAR(42) NULL,
            cellphone VARCHAR(14) NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL,
            last_sign_in TIMESTAMPTZ NOT NULL
        );`;

    pool.query(queryText).then((res) => {
        console.log(res);
        pool.end();
    }).catch((err) => {
        console.log(err);
        pool.end();
    });
};

/**
 * Drop Tables
 */
const dropTables = () => {
    const queryText = 'DROP TABLE IF EXISTS users';
    pool.query(queryText)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
};

pool.on('remove', () => {
    console.log('Client removed');
    process.exit(0);
});

module.exports = {
    createTables,
    dropTables
};

require('make-runnable');
