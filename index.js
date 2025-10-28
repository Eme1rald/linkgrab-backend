// index.js
const express = require("express");
const cors = require("cors");
const ytdlp = require("yt-dlp-exec");
const path = require("path");
const fs = require("fs");
const ffmpegPath = require("ffmpeg-static");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ LinkGrab backend is running");
});

app.post("/api/convert", async (req, res) => {
  try {
    const { url, format } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const outputFile = path.resolve(`output.${format || "mp3"}`);

    await ytdlp(url, {
      output: outputFile,
      extractAudio: true,
      audioFormat: format || "mp3",
      ffmpegLocation: ffmpegPath,
    });

    const fileData = fs.readFileSync(outputFile);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="output.${format || "mp3"}"`
    );
    res.send(fileData);

    fs.unlinkSync(outputFile);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
