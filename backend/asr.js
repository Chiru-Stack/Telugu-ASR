require("dotenv").config();

const axios = require("axios");

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const MODEL_ID = "kaarthu2003/whisper-small-telugu";

const transcribeAudio = async (audioBuffer) => {
  try {
    console.log("Starting transcription process...");

    console.log("Sending request to Hugging Face API...");
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      audioBuffer,
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "audio/wav",
        },
      }
    );

    console.log("Response received from API:", response.data);
    if (response.data.error) {
      throw new Error(response.data.error);
    } else {
      console.log("Transcription Result:", response.data.text);
      return response.data.text;
    }
  } catch (error) {
    if (error.response) {
      console.error("API responded with an error:");
      console.error("Status Code:", error.response.status);
      console.error("Headers:", error.response.headers);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error while sending request:", error.message);
    }
    throw error;
  }
};

module.exports = { transcribeAudio };
