const db = require('../db/');

/**
 * Remove double spaces
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
            "title": "Type Error",
            "detail": "The top level field data is missing from the request body"
        });
    } else {
        if ( !('type' in req.body.data) ) {
            return res.status(400).type('application/vnd.api+json').json({
                "status": "400",
                "source": { "pointer": "/" },
                "title": "Type Error",
                "detail": "The top level field type is missing from the request body"
            });
        } else {
            if (req.body.data.type !== 'users') {
                return res.status(400).type('application/vnd.api+json').json({
                    "status": "400",
                    "source": { "pointer": "/" },
                    "title": "Type Error",
                    "detail": "The resource being registered is not a user"
                });
            }
        }
    }

    if ( !('attributes' in req.body.data) ) {
        return res.status(400).type('application/vnd.api+json').json({
            "status": "400",
            "source": { "pointer": "/data" },
            "title": "Type Error",
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
            "title": "Type Error",
            "detail": "Sorry, the username is missing from the body of the request"
        });

    } else {

        const validUsernamePattern = /^[a-z\d][a-z\d-]{2,14}[a-z\d]$/i;
        if (!validUsernamePattern.test(req.body.data.attributes.username)) {
            errors.push({
                "status": "400",
                "source": { "pointer": "/data/attributes/username" },
                "title": "Type Error",
                "detail": "The username has illegal characters, it can only include letters, numbers and dashes (not at the end nor at the beginning)"
            });
        } else {
            user.username = trim(req.body.data.attributes.username);
        }

    }

    /**
     * Email field
     */
    if ( !('email' in req.body.data.attributes) ) {

        errors.push({
            "status": "400",
            "source": { "pointer": "/data/attributes/email" },
            "title": "Type Error",
            "detail": "Sorry, the email is missing from the body of the request"
        });

    } else {

        const validEmailPattern = /^[a-z0-9]+[\.\w-]*@[a-z]+([\w-]+\.)+[a-z]{2,4}$/i;
        if ( !validEmailPattern.test(req.body.data.attributes.email) ) {
            errors.push({
                "status": "400",
                "source": { "pointer": "/data/attributes/email" },
                "title": "Type Error",
                "detail": "The email provided is not valid, it has to follow the format someone@somewhere.some"
            });
        } else {
            user.email = trim(req.body.data.attributes.email);
        }

    }

    /**
     * Name
     */
    if ( !('name' in req.body.data.attributes) ) {

        errors.push({
            "status": "400",
            "source": { "pointer": "/data/attributes/name" },
            "title": "Type Error",
            "detail": "Sorry, the name field is missing from the body of the request"
        });

    } else {

        const validNamePattern = /^([a-záéíóúñ]{3,10}\s?)+$/i;
        if ( !validNamePattern.test(req.body.data.attributes.name) || req.body.data.attributes.name.length > 32) {
            errors.push({
                "status": "400",
                "source": { "pointer": "/data/attributes/name" },
                "title": "Missing Value",
                "detail": "Sorry, the name provided contains illegal characters, it can only contain letters"
            });
        } else {
            user.name = trim(req.body.data.attributes.name);
        }

    }

    // In case there are errors, end it here and return the errors
    if (errors.length > 0) {
        return res.type('application/vnd.api+json')
           .status(400)
           .json({
               "errors": errors
           });
    }

    /**
     * Check the username doesn't exit
     */
    const findUsersQuery = 'SELECT username, email FROM users WHERE users.username=$1 OR users.email=$2';
    const findUsersValues = [user.username, user.email];

    const result = await db.query(findUsersQuery, findUsersValues);

    if (result.rowCount > 0) {
        return res.status(400).type('application/vnd.api+json').json({
            "status": "400",
            "source": { "pointer": "/data/attributes" },
            "title": "Type Error",
            "detail": "The username and/or the email are/is already taken. Are you a registered user?"
        });
    }

    const createUserQuery = 'INSERT INTO users (username, email, name, created_at, updated_at, last_sign_in) VALUES ($1, $2, $3, NOW(), NOW(), NOW())';
    const createUserValues = [
        user.username,
        user.email,
        user.name
    ];

    try {
        const insertResult = await db.query(createUserQuery, createUserValues);

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
    } catch (error) {
        console.log(error);

        return res
            .type('application/vnd.api+json')
            .status(201)
            .json({
                "errors": [
                    {
                        "status": "400",
                        "source": { "pointer": "/" },
                        "title": "Type Error",
                        "detail": "There was an error in the server"
                    }
                ]
            });
    }
};

module.exports = {
    createUser
};
