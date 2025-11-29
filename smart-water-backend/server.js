const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/thingspeak", require("./routes/thingspeakRoutes"));
app.use("/api/water", require("./routes/waterRoutes"));
app.use("/api/tap", require("./routes/tapRoutes"));

app.get("/", (req, res) => {
  res.send("Smart Water Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
