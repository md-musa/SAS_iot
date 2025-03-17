const express = require('express');
const UserController = require('../controllers/user.controller');
const router = express.Router();


router.post("/", UserController.createUser);
router.post("/receive-uid", UserController.getUser);



const UserRoute =  router;
module.exports = UserRoute;


