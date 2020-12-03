var express = require('express');
var router = express.Router();

const usersController = require('../controllers/users');

/* /users */
router.route('/users')
      .post(usersController.createUser);

/* /users/{user} */
router.route('/users/:username')
      .get(usersController.getUser)
      .delete(usersController.deleteUser);

module.exports = router;
