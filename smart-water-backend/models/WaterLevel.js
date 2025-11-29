const mongoose = require("mongoose");

const WaterLevelSchema = new mongoose.Schema({
  level: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WaterLevel", WaterLevelSchema);
