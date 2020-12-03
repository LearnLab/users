const db = require('../db/');

/**
 * Global regex patterns
 */
const validUsernamePattern = /^[a-z\d][a-z\d-]{2,14}[a-z\d]$/i;
const validEmailPattern = /^[a-z0-9]+[\.\w-]*@[a-z]+([\w-]+\.)+[a-z]{2,4}$/i;
const validNamePattern = /^([a-záéíóúñ]{3,10}\s?)+$/i;

/**
 * Global errors
 */
const errors = {
    "500": {
        "status": "500",
        "source": { "pointer": "/" },
        "title": "Unknown Internal Server Error"
    }
};

/**
 * Remove double and trailing spaces
 * @param {string} string
 * @returns {string} string
 */
const trim = (str) => {
    str = str.replace(/\s{2,}/, ' ');
    str = str.replace(/^\s+/, '');
    str = str.replace(/\s+$/, '');

    return str;
};

/**
 * Create a user
 * @param {object} req
 * @param {object} res
 * @returns {object} user object
 */
const createUser = async (req, res) => {
    let errors = [];
    let user = {};

    /**
     * Top level fields
     */
    if ( !('data' in req.body) ) {
        return res.status(400).type('application/vnd.api+json').json({
            "status": "400",
            "source": { "pointer": "/" },
            "title": "Bad Request",
            "detail": "The top level field data is missing from the request body"
        });
    } else {
        if ( !('type' in req.body.data) ) {
            return res.status(400).type('application/vnd.api+json').json({
                "status": "400",
                "source": { "pointer": "/" },
                "title": "Bad Request",
                "detail": "The top level field type is missing from the request body"
            });
        } else {
            if (req.body.data.type !== 'users') {
                return res.status(400).type('application/vnd.api+json').json({
                    "status": "400",
                    "source": { "pointer": "/" },
                    "title": "Bad Request",
                    "detail": "The resource being registered is not a user"
                });
            }
        }
    }

    if ( !('attributes' in req.body.data) ) {
        return res.status(400).type('application/vnd.api+json').json({
            "status": "400",
            "source": { "pointer": "/data" },
            "title": "Bad Request",
            "detail": "The top level field attributes is missing from the request body"
        });
    }

    /**
     * Username
     */
    if ( !('username' in req.body.data.attributes) ) {

        errors.push({
            "status": "400",
            "source": { "pointer": "/data/attributes/username" },
            "title": "Bad Request",
            "detail": "Sorry, the username is missing from the body of the request"
        });

    } else {

        user.username = trim(req.body.data.attributes.username);
        if (!validUsernamePattern.test(user.username)) {
            errors.push({
                "status": "400",
                "source": { "pointer": "/data/attributes/username" },
                "title": "Bad Request",
                "detail": "The username has illegal characters, it can only include letters, numbers and dashes (not at the end nor at the beginning)"
            });
        }

    }

    /**
     * Email field
     */
    if ( !('email' in req.body.data.attributes) ) {

        errors.push({
            "status": "400",
            "source": { "pointer": "/data/attributes/email" },
            "title": "Bad Request",
            "detail": "Sorry, the email is missing from the body of the request"
        });

    } else {

        user.email = trim(req.body.data.attributes.email);
        if ( !validEmailPattern.test(user.email) ) {
            errors.push({
                "status": "400",
                "source": { "pointer": "/data/attributes/email" },
                "title": "Bad Request",
                "detail": "The email provided is not valid, it has to follow the format someone@somewhere.some"
            });
        }

    }

    /**
     * Name
     */
    if ( !('name' in req.body.data.attributes) ) {

        errors.push({
            "status": "400",
            "source": { "pointer": "/data/attributes/name" },
            "title": "Bad Request",
            "detail": "Sorry, the name field is missing from the body of the request"
        });

    } else {

        user.name = trim(req.body.data.attributes.name);
        if ( !validNamePattern.test(user.name) || user.name.length > 32) {
            errors.push({
                "status": "400",
                "source": { "pointer": "/data/attributes/name" },
                "title": "Bad Request",
                "detail": "Sorry, the name provided contains illegal characters, it can only contain letters"
            });
        }

    }

    // In case there are errors, end it here and return the errors
    if (errors.length > 0) {
        return res.type('application/vnd.api+json').status(400).json({ "errors": errors });
    }

    /**
     * Check that the username doesn't exit
     */
    const findUsersQuery = 'SELECT username, email FROM users WHERE users.username=$1 OR users.email=$2';
    const findUsersValues = [user.username, user.email];

    let result = {};

    try {
        result = await db.query(findUsersQuery, findUsersValues);
    } catch (error) {
        let publicError = errors["500"];
        publicError.message = error;

        return res
            .type('application/vnd.api+json')
            .status(500)
            .json({
                "errors": [publicError]
            });
    }

    if (result.rowCount !== 0) {
        return res.status(400).type('application/vnd.api+json').json({
            "status": "400",
            "source": { "pointer": "/data/attributes" },
            "title": "Bad Request",
            "detail": "The username and/or the email are/is already taken. Are you a registered user?"
        });
    }

    // All good, proceed with the insertion
    const createUserQuery = 'INSERT INTO users (username, email, name, created_at, updated_at, last_sign_in) VALUES ($1, $2, $3, NOW(), NOW(), NOW())';
    const createUserValues = [
        user.username,
        user.email,
        user.name
    ];

    try {
        const insertResult = await db.query(createUserQuery, createUserValues);
    } catch (error) {
        let publicError = errors["500"];
        publicError.message = error;

        return res
            .type('application/vnd.api+json')
            .status(500)
            .json({
                "errors": [publicError]
            });
    }

    return res
        .type('application/vnd.api+json')
        .status(201)
        .json({
            "data": {
                "type": "users",
                "attributes": user,
                "links": {
                    "self": `/api/v1/users/${ user.username }`
                }
            }
        });
};

/**
 * Delete user
 * @param {object} req
 * @param {object} res
 * @returns {object} object
 */
const deleteUser = async (req, res) => {

    /**
     * Check if the username param is correct
     */
    if (!validUsernamePattern.test(req.params.username)) {
        return res.type('application/vnd.api+json').status(400).json({
            "status": "400",
            "source": { "pointer": "/username" },
            "title": "Bad Request",
            "detail": "The username has illegal characters, it can only include letters, numbers and dashes (not at the end nor at the beginning)"
        });
    }

    /**
     * Check that there is exactly one member with this username
     */
    const findUserQuery = 'SELECT username, email FROM users WHERE users.username=$1';
    const findUserValues = [req.params.username];

    let result = {};

    try {
        result = await db.query(findUserQuery, findUserValues);
    } catch (error) {
        let publicError = errors["500"];
        publicError.message = error;

        return res
            .type('application/vnd.api+json')
            .status(500)
            .json({
                "errors": [publicError]
            });
    }

    if(result.rowCount === 0) {
        return res
            .type('application/vnd.api+json')
            .status(404)
            .json({
                "errors": [
                    {
                        "status": "404",
                        "source": { "pointer": "/" },
                        "title": "Not Found",
                        "detail": "There's no user with that username"
                    }
                ]
            });
    }

    if(result.rowCount > 1) {
        let publicError = errors["500"];
        publicError.message = "Somehow there is more than one user in the database";

        return res
            .type('application/vnd.api+json')
            .status(500)
            .json({
                "errors": [publicError]
            });
    }

    /**
     * Proceed with the actual deletion
     */
    const deleteQuery = 'DELETE FROM users WHERE users.username=$1';
    const deleteValue = [req.params.username];

    let executeDelete = {};

    try {
        executeDelete = db.query(deleteQuery, deleteValue);
    } catch (error) {
        let publicError = errors["500"];
        publicError.message = error;

        return res
            .type('application/vnd.api+json')
            .status(500)
            .json({
                "errors": [publicError]
            });
    }

    return res
        .type('application/vnd.api+json')
        .status(204)
        .json({
            "data": {}
        });
};

/**
 * Get a user
 * @param {object} req
 * @param {object} res
 * @returns {object} object
 */
const getUser = async (req, res) => {
    /**
     * First check the username is valid
     */
    if (!validUsernamePattern.test(req.params.username)) {
        return res.type('application/vnd.api+json').status(400).json({
            "status": "400",
            "source": { "pointer": "/username" },
            "title": "Bad Request",
            "detail": "The username has illegal characters, it can only include letters, numbers and dashes (not at the end nor at the beginning)"
        });
    }

    /**
     * Make the query
     */
    const getUserQuery = 'SELECT username, name, email, created_at, updated_at, last_sign_in FROM users WHERE users.username=$1';
    const getUserValue = [req.params.username];

    let getUserResult = {};

    try {
        getUserResult = await db.query(getUserQuery, getUserValue);
    } catch (error) {
        let publicError = errors["500"];
        publicError.message = error;

        return res.type('application/vnd.api+json').status(500).json({
            "errors": [publicError]
        });
    }

    if(getUserResult.rowCount === 0) {
        return res.type('application/vnd.api+json').status(404).json({
            "status": "404",
            "source": { "pointer": "/username" },
            "title": "User Not Found",
            "detail": "We couldn't find a user with that username",
        });
    }

    if(getUserResult.rowCount === 1) {
        const user = getUserResult.rows[0];

        return res.type('application/vnd.api+json').status(200).json({
            "data": {
                "type": "users",
                "id": user.username,
                "attributes": user,
                "links": {
                    "self": req.url
                }
            }
        });
    }

    let publicError = errors["500"];
    publicError.message = "Somewhere something happened, I don't really know what";

    return res.type('application/vnd.api+json').status(500).json({
        "errors": [publicError]
    });
};

module.exports = {
    createUser,
    deleteUser,
    getUser
};
