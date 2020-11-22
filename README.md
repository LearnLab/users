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

Example answer

{
    "user": {
        "username": "0325.diego",
        "email": "0325.diego@gmail.com",
        "name": "Diego Castillo Giraldo",
        "city": "Cali",
        "country": "Colombia",
        "website": "onemeapp.herokuapps.com",
        "image": "https://images.com/r03c49r95yq47yw9j38j74wy.jpg",
        "description": "Avid learner, who needs to be constantly moving and growing his skill set.",
        "interests": "physics, biology, programming, mathematics, chemistry, economics",
        "created_at": "22/11/20 12:45:38",
        "updated_at": "22/11/20 14:26:13",
        "last_sign_in": "22/11/20 14:10:10"
    }
}

## API endpoints

/api/v1/users/
/api/v1/users/{user}

