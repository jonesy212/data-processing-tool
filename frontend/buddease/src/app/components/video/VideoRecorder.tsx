import React, { useRef, useState } from 'react';

const VideoRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  let mediaRecorder: MediaRecorder | undefined;
  let chunks: BlobPart[] = [];
  
  const startRecording = () => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (videoRef.current) { // Null check for videoRef.current
            videoRef.current.srcObject = stream;
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.start();
            setIsRecording(true);
          }
        })
        .catch((error) => console.error('Error accessing media devices:', error));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    chunks.push(event.data);
  };

  const handleDownload = () => {
    if (chunks.length === 0) return;
    
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = 'recording.webm';
    a.click();
    window.URL.revokeObjectURL(url);
    chunks = [];
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <button onClick={startRecording} disabled={isRecording}>Start Recording</button>
      <button onClick={stopRecording} disabled={!isRecording}>Stop Recording</button>
      {isRecording && !isPaused && (
        <button onClick={pauseRecording}>Pause Recording</button>
      )}
      {isRecording && isPaused && (
        <button onClick={resumeRecording}>Resume Recording</button>
      )}
      <button onClick={handleDownload}>Download Recording</button>
    </div>
  );
};

export default VideoRecorder;
