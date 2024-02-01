import { useRef } from 'react';

const VideoRecorder = () => {
  const videoRef = useRef(null);
  let mediaRecorder;
  let chunks = [];
  
  const startRecording = () => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = handleDataAvailable;
          mediaRecorder.start();
        })
        .catch((error) => console.error('Error accessing media devices:', error));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  };

  const handleDataAvailable = (event) => {
    chunks.push(event.data);
  };

  const handleDownload = () => {
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
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <button onClick={handleDownload}>Download Recording</button>
    </div>
  );
};

export default VideoRecorder;
