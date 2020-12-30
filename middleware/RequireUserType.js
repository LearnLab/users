const { Errors } = require('../errors/Errors');
const { JSONcopy } = require('../lib/helpers');

/**
 * Require top level user field
 * type: 'users'
 *
 * @param {object} req
 * @returns {object} object
 */
const RequireUserType = (req, res, next) => {
    if (req.body.data.type !== 'users') {
        let error = JSONcopy(Errors["400"]);
        error.source = { "pointer": "/data" };
        error.detail = "The resource being registered is not a user";

        return res.status(400).json({ "errors": [error] });
    }

    next();
};

model.exports = {
    RequireUserType
};
