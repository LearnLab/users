const { JSONcopy } = require('../lib/helpers');
const { Errors } = require('../errors/Errors');

/**
 * Require the email field
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} object
 */
const RequireEmailAttribute = (req, res, next) => {

    if ( !('email' in req.body.data.attributes) ) {
        let error = JSONcopy(Errors["400"]);
        error.source = { "pointer": "/" };
        error.detail = "The field email is missing from the attributes object.";

        return res.status(400).json({ "errors": [error] });
    }

    next();
};

module.exports = {
    RequireEmailAttribute
};
