const db = require('../db/');

/**
 * Deep Copy via JSON helper methods
 * @param {object} source
 * @returns {object} target
 */
const JSONcopy = (source) => {
    return JSON.parse(JSON.stringify(source));
};

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
 * Require top level fields from the API+JSON specification
 * If the requirement is not fulfilled, return an error
 *
 * @param {object} req
 * @param {object} res
 * @returns {object} object
 */
const requireTopLevel = (req, res) => {
    let error = JSONcopy(errors["400"]);

    if ( !('data' in req.body) ) {
        error.source = { "pointer": "/" };
        error.detail = "The top level field data is missing from the request body";

        return error;
    }

    if ( !('type' in req.body.data) ) {
        error.source = { "pointer": "/" };
        error.detail = "The top level field type is missing from the request body";

        return error;
    }

    if (req.body.data.type !== 'users') {
        error.source = { "pointer": "/data" };
        error.detail = "The resource being registered is not a user";

        return error;
    }

    if ( !('attributes' in req.body.data) ) {
        error.source = { "pointer": "/data" };
        error.detail = "The top level field attributes is missing from the request body";

        return error;
    }

    return {};
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

    return {};
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

    return {};
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
        error.detail = "Sorry, the name provided contains illegal characters, it can only contain letters";

        return error;
    }

    return {};
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

    const topLevelError = requireTopLevel(req, res);

    // Check if the error is empty
    if( Object.keys(topLevelError).length > 0 ) {
        return res.status(400).json({
            "errors": [topLevelError]
        });
    }

    /**
     * Username
     */
    let usernameError = requireUsername(req);
    if( Object.keys(usernameError).length === 0 ) {
        user.username = trim(req.body.data.attributes.username);
        usernameError = validateUsername(user.username);
    }

    /**
     * Email field
     */
    let emailError = requireEmail(req);
    if( Object.keys(emailError).length === 0 ) {
        user.email = trim(req.body.data.attributes.email);
        emailError = validateEmail(user.email);
    }

    /**
     * Name
     */
    let nameError = requireName(req);
    if( Object.keys(nameError).length === 0 ) {
        user.name = trim(req.body.data.attributes.name);
        nameError = validateName(user.name);
    }

    if(Object.keys(usernameError).length !== 0)
        createErrors.push(usernameError);

    if(Object.keys(emailError).length !== 0)
        createErrors.push(emailError);

    if(Object.keys(nameError).length !== 0)
        createErrors.push(nameError);

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
    const createUserQuery = 'INSERT INTO users (username, email, name, created_at, updated_at, last_sign_in) VALUES ($1, $2, $3, NOW(), NOW(), NOW())';
    const createUserValues = [
        user.username,
        user.email,
        user.name
    ];

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
                "attributes": user,
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

    const topLevelError = requireTopLevel(req, res);

    // Check if the error is empty
    if( Object.keys(topLevelError).length > 0 ) {
        return res.status(400).json({
            "errors": [topLevelError]
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
    const getUserQuery = 'SELECT username, name, email, created_at, updated_at FROM users WHERE users.username=$1';
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
    const getUserQuery = 'SELECT username, name, email, created_at, updated_at, last_sign_in FROM users WHERE users.username=$1';
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
    const getAllUsersQuery = 'SELECT username, email, name, created_at FROM users LIMIT 10';

    let getAllUsersResult = {};

    try {
        getAllUsersResult = await db.query(getAllUsersQuery, []);
    } catch(error) {
        let publicError = JSONcopy(errors["500"]);
        publicError.detail = error;

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
