import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  rgbToHex,
} from "@mui/material";
import { AudioRecorder } from "../utils/AudioRecorder";

const AudioInputPage = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const audioRecorderRef = useRef(new AudioRecorder());
  const mediaStreamRef = useRef(null);

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const startRecording = async () => {
    if (!selectedModel) {
      setSnackbarMessage("Please select a model!");
      setSnackbarOpen(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioRecorderRef.current.mediaRecorder = new MediaRecorder(stream);
      audioRecorderRef.current.audioChunks = [];

      audioRecorderRef.current.mediaRecorder.ondataavailable = (event) => {
        audioRecorderRef.current.audioChunks.push(event.data);
      };

      audioRecorderRef.current.mediaRecorder.onstop = handleUpload;

      audioRecorderRef.current.mediaRecorder.start();
      console.log("Recording started");
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setSnackbarMessage("Error starting recording.");
      setSnackbarOpen(true);
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current.mediaRecorder) {
      audioRecorderRef.current.mediaRecorder.stop();
      console.log("Recording stopped");
      setIsRecording(false);

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }
  };

  const handleUpload = () => {
    const audioBlob = audioRecorderRef.current.getAudioBlob();
    const formData = new FormData();
    formData.append("audioFile", audioBlob);

    setIsUploading(true);

    const apiEndpoint =
      selectedModel === "whisper"
        ? "http://localhost:8080/processAudioWhisper"
        : "http://localhost:8080/processAudioWav2Vec";

    fetch(apiEndpoint, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setIsUploading(false);
        console.log("Response from server:", data);
        setTranscription(data.transcription || "No transcription available.");
        setSnackbarMessage(data.message || "File uploaded successfully!");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        setIsUploading(false);
        console.error("Error uploading file:", error);
        setSnackbarMessage("Error uploading file.");
        setSnackbarOpen(true);
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        bgcolor: "#000",
        overflow: "hidden",
        position: "relative",
        "::before": {
          content: '""',
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "20rem",
          height: "20rem",
          borderRadius: "50%",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: `
            0 0 0 1rem rgba(169, 169, 169, 0.005),
            0 0 0 3rem rgba(169, 169, 169, 0.06),
            0 0 0 6rem rgba(169, 169, 169, 0.05),
            0 0 0 9rem rgba(169, 169, 169, 0.04),
            0 0 0 12rem rgba(169, 169, 169, 0.03),
            0 0 0 15rem rgba(169, 169, 169, 0.02),
            0 0 0 18rem rgba(169, 169, 169, 0.01),
            0 0 0 21rem rgba(169, 169, 169, 0.008),
            0 0 0 24rem rgba(169, 169, 169, 0.006),
            0 0 0 27rem rgba(169, 169, 169, 0.004),
            0 0 0 30rem rgba(169, 169, 169, 0.003),
            0 0 0 33rem rgba(169, 169, 169, 0.002)
          `,
          transform: "translate(-50%, -50%)",
          animation: "heartbeat 2s infinite ease-in-out",
        },
      }}
    >
      <Card sx={{ width: 500, p: 5, boxShadow: 3, backgroundColor: "rgb(169, 169, 169)" }}>
        <CardHeader
          title="Transcribe with Wav2Vec and Whisper"
          titleTypographyProps={{ variant: "h4", fontWeight: "bold", gutterBottom: true }}
          subheader="Select a model and record audio to process"
          subheaderTypographyProps={{ variant: "body2", color: "textSecondary" }}
        />
        <CardContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="model-label">Select a model</InputLabel>
            <Select
              labelId="model-label"
              value={selectedModel}
              onChange={handleModelChange}
              label="Select a model"
            >
              <MenuItem value="whisper">Whisper</MenuItem>
              <MenuItem value="wave2vec">Wave2Vec</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
        <Box textAlign="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
          <Box mt={2} style={{ transition: "opacity 0.5s ease-in-out" }}>
            {transcription && (
              <Typography
                variant="body1"
                style={{
                  opacity: transcription ? 1 : 0,
                }}
              >
                {transcription}
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
      <Box
        component="footer"
        sx={{
          position: "absolute",
          bottom: "10rem",
          left: 0,
          right: 0,
          bgcolor: "black",
          color: "white",
          textAlign: "center",
          p: 2,
        }}
      >
        Made by Kaarthikeya Kammula, Chiranjeevi Karanki and Gunasekhar Devineni
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const styles = `
@keyframes heartbeat {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default AudioInputPage;