var express = require('express');
var router = express.Router();

const usersController = require('../controllers/users');

router.route('/users')
      .post(usersController.createUser);

router.route('/users/:username')
      .get(usersController.getUser)
      .put(usersController.updateUser)
      .delete(usersController.deleteUser);

module.exports = router;
