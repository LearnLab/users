const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

class Query() {

    constructor(table) {
        this.table = table;
        this.selectElementsList = ['*'];
        this.conditions = [];
        this.sortSpecifications = [];
        this.values = [];
    }

    select(...cols) {
        if(cols.length > 0)
            this.selectElementsList = cols;

        return this;
    }

    where(col, value) {
        this.values.push(value)
        this.conditions.push(`${this.table}.${col}=$${this.values.length}`);

        return this;
    }

    orderBy(column, order = 'ASC') {
        this.sortSpecifications.push(order.toUpperCase() === 'ASC' ? `${column}` : `${column} ${order.toUpperCase()}`);

        return this;
    }

    limitBy(limit) {
        this.limit = limit;

        return this;
    }

    getQuery() {
        // Select statement
        let query = `SELECT ${this.selectElementsList.join(', ')}`;
        // From clause
        query += ` FROM ${this.table}`;
        // Where clause
        query += this.conditions.length > 0 ? ` WHERE ${this.conditions.join(' AND ')}` : '';
        // Order By clause
        query += this.sortSpecifications.length > 0 ? ` ORDER BY ${this.sortSpecifications.join(', ')}` : '';
        // Limit clause
        query += this.limit ? ` LIMIT ${this.limit}` : '';

        return query;
    }

    async get() {
        try {
            let result = await pool.query(this.getQuery(), this.values);

            return result.rows;
        } catch(err) {
            console.log('We have an error');
        }

        return null;
    }
}

console.log('Testing the QueryBuilder');
const id = 13232342;
let myQuery = User.all();
console.log('Let\'s test the getQuery :', myQuery);

module.exports = {
    Query
};
