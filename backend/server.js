// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve both /api/... and /... so front-end works no matter which path it uses
function serveJson(filePath) {
  return (req, res) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading ${filePath}:`, err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(JSON.parse(data));
    });
  };
}

const collegesFile = path.join(__dirname, "data", "colleges.json");
const servicesFile = path.join(__dirname, "data", "services.json");

app.get("/colleges", serveJson(collegesFile));
app.get("/api/colleges", serveJson(collegesFile));

app.get("/services", serveJson(servicesFile));
app.get("/api/services", serveJson(servicesFile));

app.get("/", (req, res) => res.send("Student City Guide Backend API"));

app.listen(PORT, () => {
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});
