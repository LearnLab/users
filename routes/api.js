var express = require('express');
var router = express.Router();

const usersController = require('../controllers/users');

/* GET users */
router.route('/users')
      .post(usersController.createUser);

module.exports = router;
