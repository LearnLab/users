const { Errors } = require('../errors/Errors');
const { JSONcopy } = require('../lib/helpers');

const RequireHeader = (req, res, next) => {
  res.type('application/vnd.api+json');

  if(!req.accepts().includes('application/vnd.api+json')) {
    let error = JSONcopy(Errors["406"]);
    error.detail = "The client has not specified the application/vnd.api+json in the accept header";

    return res.status(406).json({ "errors": [error] });
  }

  if(req.headers['content-type'] !== 'application/vnd.api+json') {
    let error = JSONcopy(Errors["415"]);
    error.detail = "The Content-Type header of the request is not supported, it needs to be application/vnd.api+json, ok?"

    return res.status(415).json({ "errors": [error] });
  }

  next();
};

module.exports = {
  RequireHeader
};
