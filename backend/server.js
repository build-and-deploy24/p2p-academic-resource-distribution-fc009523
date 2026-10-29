const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const apiRoutes = require("./routes/api");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "p2p-academic-resource-distribution-api" });
});
app.use("/api", apiRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "RESOURCE_NOT_FOUND", message: "The requested resource was not found." }
  });
});

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_INPUT", message: "The file is too large (maximum 50 MB)." }
    })
     if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      error: { code: "INVALID_INPUT", message: 'The file field must be named "file".' }
    });
  };
  }
  console.error(err);
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "An unexpected server error occurred." }
  });
});
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("API running at http://localhost:" + PORT);
  });
});