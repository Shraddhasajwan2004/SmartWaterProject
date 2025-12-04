const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// @route   PUT /api/data/config
// @desc    Update Device Config
router.put('/config', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.deviceConfig = {
      ...user.deviceConfig,
      ...req.body // channelId, readKey, etc.
    };
    const updatedUser = await user.save();
    res.json(updatedUser.deviceConfig);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @route   GET /api/data/config
// @desc    Get Device Config
router.get('/config', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json(user.deviceConfig);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @route   GET /api/data/readings
// @desc    Proxy to ThingSpeak (Hides API Key from Frontend)
router.get('/readings', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user || !user.deviceConfig || !user.deviceConfig.channelId || !user.deviceConfig.readKey) {
    return res.status(400).json({ message: 'ThingSpeak not configured' });
  }

  const { channelId, readKey } = user.deviceConfig;
  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${readKey}&results=50`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error(error);
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