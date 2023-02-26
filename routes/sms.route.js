const express = require("express");
const router = express.Router();
const smsController = require("../controllers/sms.ctrl");
const verifyCookie = require('../middleware/cookie')

router.post("/sendmessage", smsController.SendSms);

router.post("/sendcode", smsController.SendCode);

router.get("/test", verifyCookie.verifyToken , (res)=>res.status(201).json({success:true}));

module.exports = router;