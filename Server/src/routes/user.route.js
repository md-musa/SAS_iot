const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();


router.post("/login", UserController.login);
router.post("/receive-uid", UserController.getUser);



const UserRoute =  router;
module.exports = UserRoute;


