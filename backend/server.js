const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());

// Routes
app.get("/colleges", (req, res) => {
  const collegesPath = path.join(__dirname, "data", "colleges.json");
  fs.readFile(collegesPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading colleges.json:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(JSON.parse(data));
  });
});

app.get("/services", (req, res) => {
  const servicesPath = path.join(__dirname, "data", "services.json");
  fs.readFile(servicesPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading services.json:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});
