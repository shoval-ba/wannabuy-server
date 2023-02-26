const express = require("express");
const router = express.Router();
const updateDataControllers = require("../controllers/updateData.ctrl");

router.post("/updateCategory", updateDataControllers.updateCategory);

router.post("/updateDealType", updateDataControllers.updateDealType);

router.post("/updateDicStore", updateDataControllers.updateDicStore);

router.post("/updateBranch", updateDataControllers.updateBranch);

module.exports = router;