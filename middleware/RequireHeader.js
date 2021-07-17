const {
  NOT_ACCEPTABLE_ACCEPT,
  UNSUPPORTED_CONTENT_TYPE,
} = require('../errors');

/* eslint-disable consistent-return */
const RequireHeader = (req, res, next) => {
  res.type('application/vnd.api+json');

  if (!req.accepts().includes('application/vnd.api+json')) {
    return res.status(406).json({ errors: [NOT_ACCEPTABLE_ACCEPT] });
  }

  if (req.headers['content-type'] !== 'application/vnd.api+json') {
    return res.status(415).json({ errors: [UNSUPPORTED_CONTENT_TYPE] });
  }

  next();
};

module.exports = RequireHeader;
