var express = require('express');
var router = express.Router();

const usersController = require('../controllers/users');
const authController = require('../controllers/authentication');

router.route('/authentication')
      .post(authController.authentication);

router.route('/users')
      .get(usersController.getAllUsers)
      .post(usersController.createUser);

router.route('/users/:username')
      .get(usersController.getUser)
      .put(usersController.updateUser)
      .delete(usersController.deleteUser);

module.exports = router;
