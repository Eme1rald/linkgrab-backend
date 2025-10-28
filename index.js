// index.js
const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

// 🟢 Root route
app.get("/", (req, res) => {
  res.send("✅ LinkGrab backend is running fine!");
});

// 🟠 Replace your old /api/convert route with this:
app.post("/api/convert", (req, res) => {
  const { url, format } = req.body;

  if (!url) return res.status(400).json({ error: "YouTube URL is required" });
  if (!["mp3", "mp4"].includes(format))
    return res.status(400).json({ error: "Invalid format. Use mp3 or mp4" });

  res.setHeader("Content-Disposition", `attachment; filename="video.${format}"`);

  // use yt-dlp directly from system
  const args =
    format === "mp3"
      ? ["-x", "--audio-format", "mp3", "-o", "-", url]
      : ["-f", "mp4", "-o", "-", url];

  const yt = spawn("yt-dlp", args);

  yt.stdout.pipe(res); // stream directly to response

  yt.stderr.on("data", (data) => {
    console.log(`yt-dlp: ${data}`);
  });

  yt.on("close", (code) => {
    if (code !== 0) {
      console.error(`yt-dlp exited with code ${code}`);
      res.end();
    }
  });
});

// 🟢 Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
