const axios = require("axios");

exports.getThingSpeakData = async (req, res) => {
  try {
    const { THINGSPEAK_API_KEY, THINGSPEAK_CHANNEL_ID } = process.env;

    const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=20`;

    const response = await axios.get(url);

    res.json(response.data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
