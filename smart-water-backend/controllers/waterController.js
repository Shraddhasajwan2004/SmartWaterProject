const WaterLevel = require("../models/WaterLevel");

exports.saveWaterLevel = async (req, res) => {
  try {
    const { level } = req.body;

    const data = await WaterLevel.create({ level });
    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWaterHistory = async (req, res) => {
  try {
    const data = await WaterLevel.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
