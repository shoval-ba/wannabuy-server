const express = require("express");
const router = express.Router();
const deleteDataController = require("../controllers/deleteData.ctrl");
const verifyCookie = require('../middleware/cookie')

router.delete("/deleteDeal",  verifyCookie.verifyUserByToken , deleteDataController.deleteDeal);

router.post("/logout",  verifyCookie.verifyUserByToken , deleteDataController.logout);

module.exports = router;