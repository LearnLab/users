const { INVALID_TOP_LEVEL } = require('../errors');
/**
 * Require the top level field data as
 * specified in https://jsonapi.org/format/#document-top-level
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 * @returns {object} object
 */
/* eslint-disable consistent-return */
const RequireTopLevel = (req, res, next) => {
  if (!('data' in req.body)) {
    return res.status(400).json({ errors: [INVALID_TOP_LEVEL] });
  }

  if (!('type' in req.body.data)) {
    return res.status(400).json({ errors: [INVALID_TOP_LEVEL] });
  }

  next();
};

module.exports = RequireTopLevel;
