const db = require('../db/');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const { Query } = require('../db/QueryBuilder');
const { JSONcopy } = require('../lib/helpers');
const { Errors } = require('../errors/Errors');

dotenv.config();

class User {

    const hidden = ['hash'];

    constructor() {
        this.created_at = new Date();
        this.updated_at = new Date();

        this.errors = [];
    }

    set name(name) {
        const validNamePattern = /^([a-záéíóúñ]{3,10}\s?)+$/i;

        if ( !validNamePattern.test(name) || name.length > 32) {
            let error = JSONcopy(Errors["400"]);
            error.source = { "pointer": "/data/attributes/name" };
            error.detail = "Sorry, the name provided contains illegal characters (it can only contain letters) or it\'s either too short or too long";

            this.errors.push(error);

            return;
        }

        this.name = name;
    }

    set email(email) {
        const validEmailPattern = /^[a-z0-9]+[\.\w-]*@[a-z]+([\w-]+\.)+[a-z]{2,4}$/i;

        if ( !validEmailPattern.test(email) ) {
            let error = JSONcopy(Errors["400"]);
            error.source = { "pointer": "/data/attributes/email" };
            error.detail = "The email provided is not valid, it has to follow the format someone@somewhere.some";

            this.errors.push(error);

            return;
        }

        this.email = email;
    }

    set username(username) {
        const validUsernamePattern = /^[a-z\d][a-z\d-]{2,14}[a-z\d]$/i;

        if (!validUsernamePattern.test(username)) {
            let error = JSONcopy(Errors["400"]);
            error.source = { "pointer": "/data/attributes/username" };
            error.detail = "The username has illegal characters, it can only include letters, numbers and dashes (not at the end nor at the beginning)";

            this.errors.push(error);

            return;
        }

        this.username = username;
    }

    set hash(password, confirm_password) {
        const ensureLowercasePattern = /[a-záéíóúñ]/;
        const ensureUppercasePattern = /[A-ZÁÉÍÓÚÑ]/;
        const ensureDigitPattern = /\d/;

        if (!ensureLowercasePattern.test(password) ||
            !ensureUppercasePattern.test(password) ||
            !ensureDigitPattern.test(password) ||
            password.length < 10 || password.length > 25) {
            let error = JSONcopy(Errors["400"]);
            error.source = { "pointer": "/data/attributes/password" };
            error.detail = "Sorry, the password provided is not valid, it should have at least 10 characters long (25 at most) and have letters (upper and lowercase) and numbers";

            this.errors.push(error);

            return;
        }

        if ( password !== confirm_password ) {
            let error = JSONcopy(Errors["400"]);
            error.source = { "pointer": "/data/attributes/password" };
            error.detail = "Sorry, the password provided is not the same as the confirmation password";

            this.errors.push(error);

            return;
        }

        this.hash = setHash(password);
    }

    static async all() {
        const allUsersQuery = new Query('users');

        let allUsers = await allUsersQuery.get();
        allUsersQuery.rows.forEach((user) => {
            hidden.forEach((hiddenField) => {
                delete user[hiddenField];
            });

            let userRecord = {
                "type": "users",
                "id": user.username,
                "attributes": user
            };

            allUsers.push(userRecord);
        });

        return allUsers;
    }

    static async where(field, value) {
        const query = new Query('users');
        return query.where(field, value);
    }

    static generateJWT(user) {
        const expiry = new Date();
        expiry.setDate(expiry.getHours() + 2);
        return jwt.sign({
            _id: user.username,
            email: user.email,
            exp: parseInt(expiry.getTime() / 1000, 10)
        }, process.env.JWT_KEY);
    }

    static async setHash(password, saltRounds = 12) {
        try {
            const salt = await bcrypt.genSalt(saltRounds);

            return await bcrypt.hash(password, salt);
        } catch(error) {
            console.log(error);
        }

        return null;
    }

    static async compare(password, hash) {
        try {
            const result = await bcrypt.compare(password, hash);
            console.log(result);
            return result;
        } catch(error) {
            console.log(error);
        }

        return false;
    }
}

module.exports = {
    User
};
