const express = require("express");
const router = express.Router();
const addDataController = require("../controllers/addData.ctrl");
const verifyCookie = require('../middleware/cookie');

router.post("/addToDealTypes", addDataController.addDealTypes);

router.post("/addToStoreCategory", addDataController.addStoreCategory);

router.post("/addToDicStore", addDataController.addDicStore);

router.post("/addToBranches", addDataController.addBranch);

router.post("/addToDeals",  verifyCookie.verifyUserByToken , addDataController.addDeal);

router.delete("/addToSurvey",  addDataController.addToSurvey);

router.post("/addChat",  addDataController.addChat);

router.post("/getNames", addDataController.getNames);


module.exports = router;