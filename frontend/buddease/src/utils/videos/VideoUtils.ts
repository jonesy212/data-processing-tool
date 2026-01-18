// VideoUtils.ts

class VideoUtils {
    static play(videoElement: HTMLVideoElement): void {
      videoElement.play();
    }
  
    static pause(videoElement: HTMLVideoElement): void {
      videoElement.pause();
    }
  
    static stop(videoElement: HTMLVideoElement): void {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  
    static setVolume(videoElement: HTMLVideoElement, volume: number): void {
      if (volume >= 0 && volume <= 1) {
        videoElement.volume = volume;
      } else {
        console.error("Volume value must be between 0 and 1.");
      }
    }
  }
  
  export default VideoUtils;
  