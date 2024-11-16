require("dotenv").config();

const axios = require("axios");

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const WHISPER_MODEL_ID = "kaarthu2003/whisper-small-telugu";
const WAV2VEC_MODEL_ID = "kaarthu2003/wav2vec2-large-xls-r-53-telugu-final-2";

// Function to transcribe audio using Whisper model
const transcribeWithWhisper = async (audioBuffer) => {
  try {
    console.log("Starting transcription process with Whisper...");

    console.log("Sending request to Hugging Face API for Whisper...");
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${WHISPER_MODEL_ID}`,
      audioBuffer,
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "audio/wav",
        },
      }
    );

    console.log("Response received from Whisper API:", response.data);
    if (response.data.error) {
      throw new Error(response.data.error);
    } else {
      console.log("Whisper Transcription Result:", response.data.text);
      return response.data.text;
    }
  } catch (error) {
    handleError(error);
  }
};

// Function to transcribe audio using Wav2Vec model
const transcribeWithWav2Vec = async (audioBuffer) => {
  try {
    console.log("Starting transcription process with Wav2Vec...");

    console.log("Sending request to Hugging Face API for Wav2Vec...");
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${WAV2VEC_MODEL_ID}`,
      audioBuffer,
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "audio/wav",
        },
      }
    );

    console.log("Response received from Wav2Vec API:", response.data);
    if (response.data.error) {
      throw new Error(response.data.error);
    } else {
      console.log("Wav2Vec Transcription Result:", response.data.text);
      return response.data.text;
    }
  } catch (error) {
    handleError(error);
  }
};

// Error handling function
const handleError = (error) => {
  if (error.response) {
    console.error("API responded with an error:");
    console.error("Status Code:", error.response.status);
    console.error("Headers:", error.response.headers);
    console.error("Data:", error.response.data);
  } else {
    console.error("Error while sending request:", error.message);
  }
  throw error;
};

module.exports = { transcribeWithWhisper, transcribeWithWav2Vec };
