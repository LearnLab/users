const users = [
    {
        "type": "users",
        "id": "0325-diego",
        "attributes": {
            "username": "0325-diego",
            "email": "0325.diego@gmail.com",
            "name": "Diego Castillo Giraldo",
            "country": "Colombia",
            "website": "https://usersjs.herokuapps.com",
            "interests": "physics, chemistry, astronomy, programming, biology, economics",
            "created_at": "21/11/20 13:54:12",
            "updated_at": "21/11/20 14:32:03",
            "last_signed_in": "21/11/20 13:54:12",
            "verified": "true"
        },
        "links": {
            "self": "/api/v1/users/0325-diego"
        }
    }
];

const createUser = (req, res) => {
    res
        .type('application/vnd.api+json')
        .status(201)
        .json({
            "data": users[0]
        });
};

module.exports = {
    createUser
};
