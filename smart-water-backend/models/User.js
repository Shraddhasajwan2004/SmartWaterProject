const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Embedded Device Configuration (Encrypted/Hashed in real prod, storing plain for prototype)
  deviceConfig: {
    channelId: { type: String, default: '' },
    readKey: { type: String, default: '' },
    writeKey: { type: String, default: '' },
    wifiSSID: { type: String, default: '' },
    wifiPass: { type: String, default: '' }
  },
  savedCodes: [{
    name: String,
    code: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);