const express = require("express");
const router = express.Router();
const { saveWaterLevel, getWaterHistory } = require("../controllers/waterController");

router.post("/save", saveWaterLevel);
router.get("/history", getWaterHistory);

module.exports = router;
