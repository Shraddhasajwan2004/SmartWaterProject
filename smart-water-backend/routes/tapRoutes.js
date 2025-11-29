const express = require("express");
const router = express.Router();
const { saveTapUsage, getTapStats } = require("../controllers/tapController");

router.post("/save", saveTapUsage);
router.get("/stats", getTapStats);

module.exports = router;
