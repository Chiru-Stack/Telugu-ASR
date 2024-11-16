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
} from "@mui/material";

const AudioInputPage = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const startRecording = async () => {
    if (!selectedModel) {
      setSnackbarMessage("Please select a model!");
      setSnackbarOpen(true);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = handleUpload;

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleUpload = () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audioFile", audioBlob);

    setIsUploading(true);

    fetch("http://localhost:8080/processAudio", {
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
      bgcolor="#f5f5f5"
    >
      <Card sx={{ width: 400, p: 2, boxShadow: 3 }}>
        <CardHeader
          title="Audio Input Page"
          titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
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

export default AudioInputPage;