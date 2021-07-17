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
  NOT_ACCEPTABLE_ACCEPT: {
    status: '406',
    source: { pointer: '/' },
    title: 'Not Acceptable',
    detail: 'The client must explicitly include application/vnd.api+json in the accept header',
  },
  UNSUPPORTED_CONTENT_TYPE: {
    status: '415',
    source: { pointer: '/' },
    title: 'Unsupported Content type',
    detail: 'The Content-Type header needs to explicitly include application/vnd.api+json',
  },
  UNKNOWN_INTERNAL_ERROR: {
    status: '500',
    source: { pointer: '/' },
    title: 'Internal Server Error',
    detail: 'There as an unknown internal server error. Communicate with client customer service',
  },
};

module.exports = Errors;
