const { JSONcopy } = require('../lib/helpers');
const { Errors } = require('../errors/Errors');

/**
 * Require both passwords used for user registration
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} object
 */
const RequirePasswordsAttribute = (req, res, next) => {
    if ( !('password' in req.body.data.attributes) || !('confirm_password' in req.body.data.attributes) ) {
        let error = JSONcopy(Errors["400"]);
        error.source = { "pointer": "/data/attributes/password" };
        error.detail = "Sorry, the password fields are missing from the attributes of the user";

        return res.status(400).json({ "errors": [error] });
    }

    next();
};

module.exports = {
    RequirePasswordsAttribute
};
