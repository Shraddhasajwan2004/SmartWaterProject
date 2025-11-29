const TapUsage = require("../models/TapUsage");

exports.saveTapUsage = async (req, res) => {
  try {
    const { personDetected, startTime, endTime } = req.body;

    const duration = (new Date(endTime) - new Date(startTime)) / 1000;

    const record = await TapUsage.create({
      personDetected,
      startTime,
      endTime,
      duration
    });

    res.json({ success: true, record });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTapStats = async (req, res) => {
  try {
    const stats = await TapUsage.find().sort({ startTime: -1 }).limit(50);
    res.json(stats);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
