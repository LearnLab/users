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
 * Global regex patterns
 */
const validUsernamePattern = /^[a-z\d][a-z\d-]{2,14}[a-z\d]$/i;
const validEmailPattern = /^[a-z0-9]+[\.\w-]*@[a-z]+([\w-]+\.)+[a-z]{2,4}$/i;
const validNamePattern = /^([a-záéíóúñ]{3,10}\s?)+$/i;
const ensureLowercasePattern = /[a-záéíóúñ]/;
const ensureUppercasePattern = /[A-ZÁÉÍÓÚÑ]/;
const ensureDigitPattern = /\d/;

/**
 * Deep Copy via JSON helper methods
 * @param {object} source
 * @returns {object} target
 */
const JSONcopy = (source) => {
    return JSON.parse(JSON.stringify(source));
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
const requireTopLevel = (req) => {
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


    if ( !('attributes' in req.body.data) ) {
        error.source = { "pointer": "/data" };
        error.detail = "The top level field attributes is missing from the request body";

        return error;
    }

    return null;
};

module.exports = {
    JSONcopy,
    trim,
    requireTopLevel
};
