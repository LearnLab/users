var express = require('express');
var router = express.Router();

const { UsersController } = require('../controllers/users');
const { RequireTopLevel } = require('../middleware/RequireTopLevel');
const { RequireUserType } = require('../middleware/RequireUserType');
const { RequireEmailAttribute } = require('../middleware/RequireEmailAttribute');
const { RequireUsernameAttribute } = require('../middleware/RequireUsernameAttribute');
const { RequirePasswordsAttribute } = require('../middleware/RequirePasswordsAttribute');

const authController = require('../controllers/authentication');

router.route('/authentication')
      .post(authController.authentication);

router.route('/users')
      .get(UsersController.index);

router.post('/users', RequireTopLevel)
      .post('/users', UsersController.create);

router.route('/users/:username')
      .get(UsersController.show)
      .delete(UsersController.delete);

router.put('/users/:username', RequireTopLevel)
      .put('/users/:username', UsersController.update);

module.exports = router;
