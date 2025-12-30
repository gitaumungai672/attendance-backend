const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Attendance Backend is running");
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.post("/api/device/attendance", (req, res) => {
  console.log("Attendance log received:", req.body);
  res.status(200).json({ status: "received" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
