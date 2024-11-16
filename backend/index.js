const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { transcribeWithWhisper, transcribeWithWav2Vec } = require("./asr");

const app = express();
const PORT = 8080;

// Middleware for CORS
app.use(cors());

// Multer configuration for memory storage
const processAudio = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio files are allowed."), false);
    }
  },
});

// Route for Whisper model transcription
app.post("/processAudioWhisper", processAudio.single("audioFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  console.log(`File uploaded successfully: ${req.file.originalname}`);

  try {
    const transcription = await transcribeWithWhisper(req.file.buffer);
    res.status(200).json({
      message: "File processed successfully with Whisper!",
      transcription: transcription,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Route for Wav2Vec model transcription
app.post("/processAudioWav2Vec", processAudio.single("audioFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  console.log(`File uploaded successfully: ${req.file.originalname}`);

  try {
    const transcription = await transcribeWithWav2Vec(req.file.buffer);
    res.status(200).json({
      message: "File processed successfully with Wav2Vec!",
      transcription: transcription,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).json({ message: `Multer Error: ${err.message}` });
  } else if (err) {
    return res.status(500).json({ message: `Error: ${err.message}` });
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
