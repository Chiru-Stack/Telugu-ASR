export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      return new Promise((resolve) => {
        this.mediaRecorder.onstart = resolve;
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw error;
    }
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  }

  getAudioBlob() {
    return new Blob(this.audioChunks, { type: "audio/wav" });
  }
} 