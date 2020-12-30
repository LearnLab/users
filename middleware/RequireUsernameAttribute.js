const { Errors } = require('../errors/Errors');

const RequireUsernameAttribute = (req, res, next) => {
    if ( !('username' in req.body.data.attributes) ) {
        let error = JSONcopy(Errors["400"]);
        error.source = { "pointer": "/data/attributes/username" };
        error.detail = "Sorry, the username is missing from the body of the request";

        return res.status(400).json({ "errors": [error] });
    }

    next();
};

module.exports = {
    RequireUsernameAttribute
};
