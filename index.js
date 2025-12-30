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
app.post("/setup", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        device_user_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        department VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS biometric_logs (
        id SERIAL PRIMARY KEY,
        device_user_id VARCHAR(50) NOT NULL,
        log_time TIMESTAMPTZ NOT NULL,
        verify_type VARCHAR(50),
        device_id VARCHAR(100),
        payload JSONB,
        received_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS attendance_events (
        id SERIAL PRIMARY KEY,
        employee_id INT REFERENCES employees(id),
        event_type VARCHAR(3) NOT NULL CHECK (event_type IN ('IN','OUT')),
        event_time TIMESTAMPTZ NOT NULL,
        source VARCHAR(50) DEFAULT 'biometric',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    res.json({ ok: true, message: "Tables created/verified" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});



