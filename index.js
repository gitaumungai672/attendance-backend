const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Home
app.get("/", (req, res) => {
  res.send("Attendance Backend is running");
});

// Health
app.get("/health", (req, res) => {
  res.send("OK");
});

// Postgres pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// DB test
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Device attendance receiver (for later)
app.post("/api/device/attendance", (req, res) => {
  console.log("Attendance log received:", req.body);
  res.status(200).json({ status: "received" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});


