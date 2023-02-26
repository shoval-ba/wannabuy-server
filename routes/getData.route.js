const express = require("express");
const router = express.Router();
const getDataController = require("../controllers/getData.ctrl");
const verifyCookie = require('../middleware/cookie')

router.get("/getBranches",  getDataController.getStores);

router.get("/getUsers", getDataController.getUsers);

router.get("/getDicStores",  getDataController.dicStores);

router.get("/dicDealTypes", getDataController.dicDealTypes);

router.get("/getDeals",  verifyCookie.verifyTokenToDeals , getDataController.getDeals);

router.post("/getBranchesNear",  getDataController.getBranchesNear);

router.post("/getDealsNear",  getDataController.getDealsNear);

router.post("/getDeal",  getDataController.getDeal);

router.post("/getChats",  getDataController.getChats);

module.exports = router;