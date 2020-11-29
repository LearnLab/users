# users
A complete user API to experiment, with the json:api specification

## User information

Essential
Username     : NON NULL, UNIQUE, inmutable
Email        : NON NULL, UNIQUE, mutable,   must confirm
Name         : NON NULL,         mutable

Reference
City         : NULL,             mutable
Country      : NULL,             mutable
Phone number : NULL,     UNIQUE, mutable
Website      : NULL,     UNIQUE,
Twitter      : NULL,     UNIQUE,
Instagram    : NULL,     UNIQUE,
LinkedIn     : NULL,     UNIQUE,

Public Miscellaneous
Image        : NULL,             mutable
Description  : NULL,             mutable
Interests    : NULL,             mutable

Session information
Created at   : NON NULL,
Updated at   : NON NULL,
Last sign in : NON NULL,
