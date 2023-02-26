const express = require("express");
const router = express.Router();
const getDataByLocationController = require("../controllers/getDataByLocation.ctrl");
const getDataController = require("../controllers/getData.ctrl");
const verifyCookie = require('../middleware/cookie');

router.post("/getMall",  getDataByLocationController.getMall);

router.post("/getStores",  getDataByLocationController.getStores);

router.post("/getDealsInMall",  verifyCookie.verifyUserToDeals , getDataByLocationController.getDealsInMall);

router.post("/getUser", verifyCookie.verifyUserByToken , getDataController.getMyUser);

router.post("/autocompleteStores",  getDataByLocationController.getStoresAutocomplete);

router.get("/getCategories", getDataController.getCategories);

module.exports = router;