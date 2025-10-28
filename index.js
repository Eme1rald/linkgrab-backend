// index.js - LinkGrab Backend with convert route
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ LinkGrab backend is running");
});

// --- Conversion route ---
app.post("/api/convert", (req, res) => {
  const { url, format } = req.body;

  if (!url) return res.status(400).json({ error: "YouTube URL is required" });
  if (!["mp3", "mp4"].includes(format))
    return res.status(400).json({ error: "Invalid format. Use mp3 or mp4" });

  const outputFile = path.join(__dirname, `output.${format}`);
  const command =
    format === "mp3"
      ? `yt-dlp -x --audio-format mp3 -o "${outputFile}" "${url}"`
      : `yt-dlp -f mp4 -o "${outputFile}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: "Download failed", details: stderr });
    }

    // Send file to client
    res.download(outputFile, (err) => {
      if (err) console.error("File send error:", err);
      fs.unlink(outputFile, () => {}); // cleanup after send
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
