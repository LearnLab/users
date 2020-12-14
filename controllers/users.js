const db = require('../db/');
const { User } = require('../models/user');
const { JSONcopy, trim, requireTopLevel } = require('../lib/helpers');

/**
 * Global regex patterns
 */
const validUsernamePattern = /^[a-z\d][a-z\d-]{2,14}[a-z\d]$/i;
const validEmailPattern = /^[a-z0-9]+[\.\w-]*@[a-z]+([\w-]+\.)+[a-z]{2,4}$/i;
const validNamePattern = /^([a-záéíóúñ]{3,10}\s?)+$/i;
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

    return null;
};

/**
 * Require username, or return an error (not a server response) when
 * missing
 *
 * @param {object} req
 * @returns {object} error
 */
const requireUsername = (req) => {
    if ( !('username' in req.body.data.attributes) ) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/username" };
        error.detail = "Sorry, the username is missing from the body of the request";

        return error;
    }

    return null;
};

/**
 * Validate username, or return an error (not a server response) when
 * not valid
 *
 * @param {string} username
 * @returns {object} error
 */
const validateUsername = (username) => {
    if (!validUsernamePattern.test(username)) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/username" };
        error.detail = "The username has illegal characters, it can only include letters, numbers and dashes (not at the end nor at the beginning)";

        return error;
    }

    return null;
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

    return null;
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

    return null;
};

/**
 * Require a password, or return an error (not a server error) when
 * missing
 *
 * @param {object} req
 * @returns {object} error
 */
const requirePasswords = (req) => {
    if ( !('password' in req.body.data.attributes) || !('confirm_password' in req.body.data.attributes) ) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/password" };
        error.detail = "Sorry, the password fields are missing from the body of the request";

        return error;
    }

    return null;
};

/**
 * Validate a password, or return an error (not a server error) when
 * invalid
 *
 * @param {object} attributes
 * @returns {object} error
 */
const validatePassword = (password, confirm_password) => {

    if ( !ensureLowercasePattern.test(password) ||
         !ensureUppercasePattern.test(password) ||
         !ensureDigitPattern.test(password) ||
         password.length < 10 ||
         password.length > 25) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/password" };
        error.detail = "Sorry, the password provided is not valid, it should have at least 10 characters long (25 at most) and have letters (upper and lowercase) and numbers";

        return error;
    }

    if ( password !== confirm_password ) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/password" };
        error.detail = "Sorry, the password provided is not the same as the confirmation password";

        return error;
    }

    return null;
};

/**
 * Require a name, or return an error (not a server error) when
 * missing
 *
 * @param {object} req
 * @returns {object} error
 */
const requireName = (req) => {
    if ( !('name' in req.body.data.attributes) ) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/name" };
        error.detail = "Sorry, the name field is missing from the body of the request";

        return error;
    }

    return null;
};

/**
 * Validate a name, or return an error (not a server error) when
 * invalid
 *
 * @param {string} email
 * @returns {object} error
 */
const validateName = (name) => {
    if ( !validNamePattern.test(name) || name.length > 32) {
        let error = JSONcopy(errors["400"]);
        error.source = { "pointer": "/data/attributes/name" };
        error.detail = "Sorry, the name provided contains illegal characters (it can only contain letters) or it\'s either too short or too long";

        return error;
    }

    return null;
};

/**
 * Create a user
 * @param {object} req
 * @param {object} res
 * @returns {object} user object
 */
const createUser = async (req, res) => {
    let createErrors = [];
    let user = {};

    const topLevelError = requireTopLevel(req);

    if(topLevelError)
        return res.status(400).json({ "errors": [topLevelError] });

    const userTopLevelError = requireUserTopLevel(req);

    if(userTopLevelError)
        return res.status(400).json({ "errors": [userTopLevelError] })

    /**
     * Username
     */
    let usernameError = requireUsername(req);
    if(usernameError) {
        user.username = trim(req.body.data.attributes.username);
        usernameError = validateUsername(user.username);
    }

    /**
     * Email field
     */
    let emailError = requireEmail(req);
    if(emailError) {
        user.email = trim(req.body.data.attributes.email);
        emailError = validateEmail(user.email);
    }

    /**
     * Password
     */
    let passwordError = requirePasswords(req);
    if(passwordError) {
        user.hash = await User.setHash(req.body.data.attributes.password);
        passwordError = validatePassword(req.body.data.attributes);
    }

    /**
     * Name
     */
    let nameError = requireName(req);
    if(nameError) {
        user.name = trim(req.body.data.attributes.name);
        nameError = validateName(user.name);
    }


    if(usernameError)
        createErrors.push(usernameError);

    if(emailError)
        createErrors.push(emailError);

    if(nameError)
        createErrors.push(nameError);

    if(passwordError)
        createErrors.push(passwordError);

    // In case there are errors, end it here and return the errors
    if (createErrors.length > 0) {
        return res.status(400).json({ "errors": createErrors });
    }

    /**
     * Check that the username doesn't exist
     */
    const findUsersQuery = 'SELECT username, email FROM users WHERE users.username=$1 OR users.email=$2';
    const findUsersValues = [user.username, user.email];

    let result = {};

    try {
        result = await db.query(findUsersQuery, findUsersValues);
    } catch (error) {
        let publicError = JSONcopy(errors["500"]);
        publicError.message = error;

        return res.status(500).json({"errors": [publicError]});
    }

    if (result.rowCount !== 0) {
        let publicError = JSONcopy(errors["400"]);
        publicError.source = { "pointer": "/data/attributes" };
        publicError.detail = "The username and/or the email are already taken. Are you a registered user?";

        return res.status(400).json(publicError);
    }

    // All good, proceed with the insertion
    const createUserQuery = 'INSERT INTO users (username, hash, email, validated, name, created_at, updated_at, last_sign_in) VALUES ($1, $2, $3, FALSE, $4, NOW(), NOW(), NOW())';
    const createUserValues = [
        user.username,
        user.hash,
        user.email,
        user.name
    ];

    const publicUser = {
        username: user.username,
        name: user.name
    };

    try {
        const insertResult = await db.query(createUserQuery, createUserValues);
    } catch (error) {
        let publicError = JSONcopy(errors["500"]);
        publicError.message = error;

        return res.status(500).json({"errors": [publicError]});
    }

    return res.status(201).json({
            "data": {
                "type": "users",
                "attributes": publicUser,
                "links": {
                    "self": `/api/v1/users/${ user.username }`
                }
            }
        });
};

/**
 * Update user
 * @param {object} req
 * @param {object} res
 * @returns {object} object
 */
const updateUser = async (req, res) => {
    let errors = [];
    let user = {};

    const topLevelError = requireTopLevel(req);
    const userTopLevelError = requireUserTopLevel(req);

    // Check if the error is empty
    if( Object.keys(topLevelError).length > 0 ) {
        return res.status(400).json({
            "errors": [topLevelError]
        });
    }

    if( Object.keys(userTopLevelError).length > 0 ) {
        return res.status(400).json({
            "errors": [userTopLevelError]
        });
    }

    /**
     * Validate param user
     */
    user.username = req.params.username;
    errors.push( validateUsername(user.username) );

    /**
     * Email field
     */
    if ( 'email' in req.body.data.attributes ) {
        user.email = trim(req.body.data.attributes.email);
        errors.push( validateEmail(user.email) );
    }

    /**
     * Name
     */
    if ( 'name' in req.body.data.attributes ) {
        user.name = trim(req.body.data.attributes.name);
        errors.push( validateName(user.name) );
    }

    // In case there are errors, end it here and return the errors
    if (errors.length > 0) {
        return res.status(400).json({ "errors": errors });
    }

    /**
     * Update user
     */
    const updateQuery = 'UPDATE users SET email=$1, name=$2, updated_at=NOW() WHERE users.username=$3';
    const updateValues = [user.email, user.name, user.username];

    let updateResult = {};

    try {
        updateResult = await db.query(updateQuery, updateValues);
    } catch(error) {
        let publicError = JSONcopy(errors["500"]);
        publicError.message = error;

        return res.status(500).json({ "errors": [publicError] });
    }

    if(updateResult.rowCount === 0) {
        return res.status(404).json({
            "errors": [{
                "status": "404",
                "title": "Resource Not Found",
                "source": { "pointer": "/users/{user}" },
                "detail": "The user you are trying to update does not exist, maybe you misspoke?"
            }]
        });
    }

    /**
     * Get user from the database
     */
    const getUserQuery = 'SELECT username, name, created_at, updated_at FROM users WHERE users.username=$1';
    const getUserValue = [user.username];

    let userResult = {};

    try {
        userResult = await db.query(getUserQuery, getUserValue);
    } catch(error) {
        let publicError = JSONcopy(errors["500"]);
        publicError.message = error;

        return res.status(500).json({ "errors": [publicError] });
    }

    user = userResult.rows[0];

    return res.status(200).json({
        "data": {
            "type": "users",
            "id": user.username,
            "attributes": user
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
    const usernameError = validateUsername(req.params.username);
    if (Object.keys(usernameError).length !== 0)
        return res.status(400).json({ "errors": [usernameError] });

    /**
     * Check that there is exactly one member with this username
     */
    const findUserQuery = 'SELECT username, email FROM users WHERE users.username=$1';
    const findUserValues = [req.params.username];

    let result = {};

    try {
        result = await db.query(findUserQuery, findUserValues);
    } catch (error) {
        let publicError = JSONcopy(errors["500"]);
        publicError.message = error;

        return res.status(500).json({"errors": [publicError]});
    }

    if(result.rowCount !== 1) {
        return res.status(404).json({
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

    /**
     * Proceed with the actual deletion
     */
    const deleteQuery = 'DELETE FROM users WHERE users.username=$1';
    const deleteValue = [req.params.username];

    let executeDelete = {};

    try {
        executeDelete = db.query(deleteQuery, deleteValue);
    } catch (error) {
        let publicError = JSONcopy(errors["500"]);
        publicError.message = error;

        return res.status(500).json({ "errors": [publicError] });
    }

    return res.status(204).json({ "data": {} });
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
    const usernameError = validateUsername(req.params.username);
    if(Object.keys(usernameError).length !== 0)
        return res.status(400).json({ "errors": [usernameError] });

    /**
     * Make the query
     */
    const getUserQuery = 'SELECT username, name, created_at, updated_at, last_sign_in FROM users WHERE users.username=$1';
    const getUserValue = [req.params.username];

    let getUserResult = {};

    try {
        getUserResult = await db.query(getUserQuery, getUserValue);
    } catch (error) {
        let publicError = JSONcopy(errors["500"]);
        publicError.message = error;

        return res.status(500).json({ "errors": [publicError] });
    }

    if(getUserResult.rowCount === 0) {
        return res.status(404).json({
            "status": "404",
            "source": { "pointer": "/username" },
            "title": "User Not Found",
            "detail": "We couldn't find a user with that username",
        });
    }

    if(getUserResult.rowCount === 1) {
        const user = getUserResult.rows[0];

        return res.status(200).json({
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

    let publicError = JSONcopy(errors["500"]);
    publicError.detail = "Somewhere something happened, I don't really know what";

    return res.status(500).json({ "errors": [publicError] });
};

/**
 * Get all users
 * @param {object} req
 * @param {object} res
 * @returns {object} object
 */
const getAllUsers = async (req, res) => {
    /**
     * SQL Query
     */
    const getAllUsersQuery = 'SELECT username, name, created_at FROM users LIMIT 10';

    let getAllUsersResult = {};

    try {
        getAllUsersResult = await db.query(getAllUsersQuery, []);
    } catch(error) {
        let publicError = JSONcopy(errors["500"]);

        if(error.code === '42P01')
            publicError.detail = "The table requested does not exist.";

        return res.status(500).json({ "errors": [publicError] });
    }

    let allUsers = [];
    getAllUsersResult.rows.forEach((user) => {
        let userRecord = {
            "type": "users",
            "id": user.username,
            "attributes": user
        };

        allUsers.push(userRecord);
    });

    return res.status(200).json({
        "links": {
            "self": req.path
        },
        "data": allUsers
    });
};

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    getAllUsers
};
