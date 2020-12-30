const { JSONcopy } = require('../lib/helpers');
const { Errors } = require('../errors/Errors');

/**
 * Require the top level field Data
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} object
 */
const RequireTopLevel = (req, res, next) => {
    console.log('I\'m in the RequireTopLevel middleware');

    if ( !('data' in req.body) ) {
        let error = JSONcopy(Errors["400"]);
        error.source = { "pointer": "/" };
        error.detail = "The top level field data is missing from the request body";

        return res.status(400).json({ "errors": [error] });
    }

    if ( !('type' in req.body.data) ) {
        let error = JSONcopy(Errors["400"]);
        error.source = { "pointer": "/" };
        error.detail = "The top level field type is missing from the request body";

        return res.status(400).json({ "errors": [error] });
    }

    if ( !('attributes' in req.body.data) ) {
        let error = JSONcopy(Errors["400"]);
        error.source = { "pointer": "/data" };
        error.detail = "The top level field attributes is missing from the request body";

        return res.status(400).json({ "errors": [error] });
    }

    next();
};

module.exports = {
    RequireTopLevel
};
