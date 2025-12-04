const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   PUT /api/data/config
// @desc    Update Device Config
router.put('/config', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Explicitly map fields to ensure Mongoose detects changes
      user.deviceConfig.channelId = req.body.channelId || user.deviceConfig.channelId;
      user.deviceConfig.readKey = req.body.readKey || user.deviceConfig.readKey;
      user.deviceConfig.writeKey = req.body.writeKey || user.deviceConfig.writeKey;
      user.deviceConfig.wifiSSID = req.body.wifiSSID || user.deviceConfig.wifiSSID;
      user.deviceConfig.wifiPass = req.body.wifiPass || user.deviceConfig.wifiPass;

      // Mark as modified just in case
      user.markModified('deviceConfig');
      
      const updatedUser = await user.save();
      res.json(updatedUser.deviceConfig);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Config Save Error:", error);
    res.status(500).json({ message: 'Server Error saving config' });
  }
});

// @route   GET /api/data/config
// @desc    Get Device Config
router.get('/config', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user.deviceConfig);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching config' });
  }
});

// @route   GET /api/data/readings
// @desc    Proxy to ThingSpeak (Hides API Key from Frontend)
router.get('/readings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Strict check for configuration
    if (!user || !user.deviceConfig || !user.deviceConfig.channelId || !user.deviceConfig.readKey) {
      return res.status(400).json({ message: 'ThingSpeak not configured' });
    }

    const { channelId, readKey } = user.deviceConfig;
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readKey}&results=50`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Proxy Error:", error.message);
    if(error.response) {
       // Pass through ThingSpeak errors (like 404 for bad channel ID)
       return res.status(error.response.status).json({ message: error.response.statusText });
    }
    res.status(500).json({ message: 'Error fetching data from ThingSpeak' });
  }
});

// @route   POST /api/data/code
// @desc    Save generated code
router.post('/code', protect, async (req, res) => {
  const { name, code } = req.body;
  const user = await User.findById(req.user._id);

  if(user) {
    user.savedCodes.push({ name, code });
    await user.save();
    res.status(201).json({ message: 'Code saved' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;