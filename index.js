// index.js
import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ LinkGrab backend is up and running!");
});

app.post("/api/convert", async (req, res) => {
  const { url, format } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  const output = path.join(__dirname, `output.${format || "mp3"}`);
  const command = `yt-dlp -f bestaudio --extract-audio --audio-format ${format || "mp3"} -o "${output}" "${url}"`;

  console.log("▶️ Running:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error:", stderr);
      return res.status(500).json({ error: "Download failed" });
    }

    console.log("✅ Download completed");
    res.download(output, (err) => {
      fs.unlinkSync(output); // delete file after sending
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
