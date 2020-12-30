'use strict';

const db = require('../db/');
const { User } = require('../models/user');
const { JSONcopy, trim } = require('../lib/helpers');
const { Errors } = require('../errors/Errors');

const UsersController = {

    /**
     * Use this to get all users
     *
     * @param {object} req
     * @param {object} res
     * @returns {object} object
     */
    index: async (req, res) => {
        const users = User.all();

        return res.status(200).json({
            "links": {
                "self": req.path
            },
            "data": users
        });
    },

    /**
     * Use this for creating a user
     *
     * @param {object} req
     * @param {object} res
     * @returns {object} user object
     */
    create: async (req, res) => {

        let user = new User();
        user.hash(req.body.data.attributes.password, req.body.data.attributes.confirm_password);

        /**
         * Check that neither the username nor the email exist
         */
        const existent = User.where('username', user.username).where('email', user.email, 'or').getOne();

        if (existent) {
            let publicError = JSONcopy(Errors["400"]);
            publicError.source = { "pointer": "/data/attributes" };
            publicError.detail = "The username and/or the email are already taken. Are you a registered user?";

            return res.status(400).json({ "errors": [publicError] });
        }

        // All good, proceed with the insertion
        user.save();

        return res.status(201).json({
                "data": {
                    "type": "users",
                    "attributes": user.public(),
                    "links": {
                        "self": `/api/v1/users/${ user.username }`
                    }
                }
            });
    },

    /**
    * Use this when updating a User
    *
    * @param {object} req
    * @param {object} res
    * @returns {object} object
    */
    update: async (req, res) => {

        let user = User.find(req.params.username);
        if(!user) {
            return res.status(404).json({
                "errors": [{
                    "status": "404",
                    "title": "Resource Not Found",
                    "source": { "pointer": "/users/{user}" },
                    "detail": "The user you are trying to update does not exist, maybe you misspoke?"
                }]
            });
        }

        if ( 'email' in req.body.data.attributes )
            user.email( req.body.data.attributes.email );

        if ( 'name' in req.body.data.attributes )
            user.name( trim(req.body.data.attributes.name) );

        user.update();

        return res.status(200).json({
            "data": {
                "type": "users",
                "id": user.username,
                "attributes": user.public()
            }
        });
    },

    /**
     * Use this for deleting a user
     *
     * @param {object} req
     * @param {object} res
     * @returns {object} object
     */
    delete: async (req, res) => {
        const user = User.find(req.params.username);

        if(!user) {
            let error = JSONcopy(errors['404']);
            error.source = { "pointer": "/" };
            error.detail = "The user does not exist in the database"
            return res.status(404).json({ "errors": [error] });
        }

        // Deletion
        user.delete();

        return res.status(204).json({ "data": {} });
    },

    /**
    * Use this when showing a single User
    *
    * @param {object} req
    * @param {object} res
    * @returns {object} object
    */
    show: async (req, res) => {
        const usernameError = validateUsername(req.params.username);
        if(usernameError)
            return res.status(400).json({ "errors": [usernameError] });

        const user = User.find(req.params.username);

        if(!user) {
            return res.status(404).json({
                "status": "404",
                "source": { "pointer": "/username" },
                "title": "User Not Found",
                "detail": "We couldn't find a user with that username",
            });
        }

        return res.status(200).json({
            "data": {
                "type": "users",
                "id": user.username,
                "attributes": user,
                "links": {
                    "self": req.url
                }
            }
        });
    }

};

module.exports = {
    UsersController
};
