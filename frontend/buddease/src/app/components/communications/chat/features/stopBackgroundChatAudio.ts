// Define the BackgroundChatAudio class
class BackgroundChatAudio {
  private audioElement: HTMLAudioElement;
  isPlaying: boolean = false;

  constructor(audioSrc: string) {
    // Initialize the audio element with the provided source
    this.audioElement = new Audio(audioSrc);
    // Add event listeners to track the playback state
    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      console.log('Background chat audio started.');
    });
    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      console.log('Background chat audio paused.');
    });
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      console.log('Background chat audio ended.');
    });
  }

  // Method to start playing background chat audio
  play() {
    // Check if the audio is already playing
    if (!this.isPlaying) {
      this.audioElement.play();
    }
  }

  // Method to stop playing background chat audio
  stop() {
    // Check if the audio is playing
    if (this.isPlaying) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }
}

// Example usage:
const audioSrc = 'path/to/background-audio.mp3';
const backgroundChatAudio = new BackgroundChatAudio(audioSrc);

// To play the background chat audio
backgroundChatAudio.play();

// To stop the background chat audio
backgroundChatAudio.stop();

// Function to stop background chat audio
const stopBackgroundChatAudio = () => {
  // Check if background chat audio is currently playing
  if (backgroundChatAudio.isPlaying) {
    // Stop the background chat audio
    backgroundChatAudio.stop();
  } else {
    console.log('No background chat audio is currently playing.');
  }
};

export default stopBackgroundChatAudio;
