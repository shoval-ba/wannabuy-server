const express = require("express");
const router = express.Router();
const getNamesController = require("../controllers/getNames.ctrl");

router.post("/getBranchesNames", getNamesController.getBranchesNames);

router.post("/getDicStoresNames", getNamesController.getDicStoresNames);

router.post("/getFloor", getNamesController.getFloor);

module.exports = router;