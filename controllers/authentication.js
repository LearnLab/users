const db = require('../db/');
const { User } = require('../models/user');
const { JSONcopy, trim, requireTopLevel } = require('../lib/helpers');

/**
 * Global regex patterns
 */
const validEmailPattern = /^[a-z0-9]+[\.\w-]*@[a-z]+([\w-]+\.)+[a-z]{2,4}$/i;
const ensureLowercasePattern = /[a-záéíóúñ]/;
const ensureUppercasePattern = /[A-ZÁÉÍÓÚÑ]/;
const ensureDigitPattern = /\d/;

/**
 * Users global errors
 */
const errors = {
    "400": {
        "status": "400",
        "title": "Bad Request"
    },
    "404": {
        "status": "404",
        "title": "Not Found"
    },
    "500": {
        "status": "500",
        "title": "Unknown Internal Server Error"
    }
};

/**
 * Require top level user field
 * type: 'users'
 * If the requirement is not fulfilled, return an error
 *
 * @param {object} req
 * @returns {object} object
 */
const requireUserTopLevel = (req) => {
    if (req.body.data.type !== 'users') {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data" };
        error.detail = "The resource being registered is not a user";

        return error;
    }

    return {};
};

/**
 * Require an email, or return an error (not a server error) when
 * missing
 *
 * @param {object} req
 * @returns {object} error
 */
const requireEmail = (req) => {
    if ( !('email' in req.body.data.attributes) ) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/email" };
        error.detail = "Sorry, the email is missing from the body of the request";

        return error;

    }

    return {};
};

/**
 * Validate an email, or return an error (not a server error) when
 * invalid
 *
 * @param {string} email
 * @returns {object} error
 */
const validateEmail = (email) => {
    if ( !validEmailPattern.test(email) ) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/email" };
        error.detail = "The email provided is not valid, it has to follow the format someone@somewhere.some";

        return error;
    }

    return {};
};

/**
 * Require a password, or return an error (not a server error) when
 * missing
 *
 * @param {object} req
 * @returns {object} error
 */
const requirePassword = (req) => {
    if ( !('password' in req.body.data.attributes) ) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/password" };
        error.detail = "Sorry, the password field is missing from the body of the request";

        return error;
    }

    return {};
};

/**
 * Validate a password, or return an error (not a server error) when
 * invalid
 *
 * @param {object} attributes
 * @returns {object} error
 */
const validatePassword = (password) => {
    if ( !ensureLowercasePattern.test(password) ||
         !ensureUppercasePattern.test(password) ||
         !ensureDigitPattern.test(password) ||
         password.length < 10 || password.length > 25) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/password" };
        error.detail = "Sorry, the password can not be shorter than 10 characters, or longer than 25 characters";

        return error;
    }

    return {};
};

/**
 * User authentication controller
 */
const authentication = async (req, res) => {
    let user = {};

    /**
     * Require top level fields for request and then
     * ensure the "type" field equals "users"
     */
    const topLevelError = requireTopLevel(req);

    if( Object.keys(topLevelError).length !== 0 )
        return res.status(400).json({ "errors": [topLevelError] });

    const userTopLevelError = requireUserTopLevel(req);

    if( Object.keys(userTopLevelError).length !== 0 )
        return res.status(400).json({ "errors": [userTopLevelError] })

    /**
     * Email field
     */
    let emailError = requireEmail(req);
    if( Object.keys(emailError).length === 0 ) {
        user.email = trim(req.body.data.attributes.email);
        emailError = validateEmail(user.email);
    }

    /**
     * Password
     */
    let passwordError = requirePassword(req);
    if( Object.keys(passwordError).length === 0 ) {
        user.hash = req.body.data.attributes.password;
        passwordError = validatePassword(user.hash);
    }

    /**
     * Fetch user data from DB
     */
    const getUserCredentialsQuery = 'SELECT username, email, hash FROM users WHERE users.email=$1';
    const getUserCredentialsValue = [req.body.data.attributes.email];

    let userCredentials = {};

    try {
        userCredentials = await db.query(getUserCredentialsQuery, getUserCredentialsValue);
    } catch(error) {
        let publicError = JSONcopy(errors["500"]);
        publicError.detail = error;

        return res.status(500).json({ "errors": [publicError] });
    }

    if(userCredentials.rowCount === 1) {
        const dbUser = userCredentials.rows[0];

        const authorize = await User.compare(user.hash, dbUser.hash);
        if(authorize) {
            const jwt = await User.generateJWT(user);

            return res.status(200).json({
                "data": {
                    "id": dbUser.username,
                    "type": "users",
                    "attributes": {
                        "token": jwt
                    }
                }
            });
        }
    }

    let errorResponse = JSONcopy(errors["404"]);
    errorResponse.detail = 'We haven\'t found that combination of email and password. Check the credentials again and let us know.';

    return res.status(404).json({ "errors": [errorResponse] });
};

module.exports = {
    authentication
};
