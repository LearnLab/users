const Errors = {
  FAIL_DECODING_URI_PARAM: {
    status: '400',
    source: { pointer: '/data/attributes' },
    title: 'Failed to decode the URI param',
    detail: 'The parameter had an invalid form',
  },
  UNAUTHORIZED_ACCESS: {
    status: '401',
    title: 'Unauthorized Access',
    detail: 'You are not allowed to access this resource.',
  },
  RESOURCE_NOT_FOUND: {
    status: '404',
    source: { pointer: '/' },
    title: 'Resource not Found',
    detail: 'Sorry, we could not find the resource you were looking for, maybe you misspoke?',
  },
  406: {
    status: 406,
    title: 'Not Acceptable',
  },
  415: {
    status: 415,
    title: 'Unsupported Media Type',
  },
  500: {
    status: 500,
    title: 'Unknown Internal Server Error',
  },
};

module.exports = Errors;
