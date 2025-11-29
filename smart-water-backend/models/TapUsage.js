const mongoose = require("mongoose");

const TapUsageSchema = new mongoose.Schema({
  personDetected: Boolean,
  startTime: Date,
  endTime: Date,
  duration: Number // seconds
});

module.exports = mongoose.model("TapUsage", TapUsageSchema);
