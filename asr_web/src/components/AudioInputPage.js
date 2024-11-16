import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

const AudioInputPage = () => {
  const [selectedModel, setSelectedModel] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState("");

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleAudioFileChange = (event) => {
    if (event.target.files) {
      setAudioFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!audioFile || !selectedModel) {
      alert("Please select a model and upload a file!");
      return;
    }
  
    const formData = new FormData();
    formData.append("audioFile", audioFile);
  
    setIsUploading(true);

    fetch("http://localhost:8080/processAudio", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setIsUploading(false);
        console.log("Response from server:", data);
        alert(data.message || "File uploaded successfully!");
        setTranscription(data.transcription || "");
      })
      .catch((error) => {
        setIsUploading(false);
        console.error("Error uploading file:", error);
      });
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
          subheader="Select a model and upload an audio file to process"
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
          <TextField
            fullWidth
            margin="normal"
            type="file"
            inputProps={{ accept: "audio/*" }}
            onChange={handleAudioFileChange}
            helperText={audioFile ? `Selected: ${audioFile.name}` : ""}
          />
        </CardContent>
        <Box textAlign="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload and Process"}
          </Button>
          {transcription && (
            <Typography
              variant="body1"
              mt={2}
              style={{
                opacity: transcription ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              {transcription}
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default AudioInputPage;