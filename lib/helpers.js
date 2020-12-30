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

module.exports = {
    JSONcopy,
    trim
};
