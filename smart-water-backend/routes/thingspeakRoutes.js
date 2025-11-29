const express = require("express");
const router = express.Router();
const { getThingSpeakData } = require("../controllers/thingspeakController");

router.get("/", getThingSpeakData);

module.exports = router;
