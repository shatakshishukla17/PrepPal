'use client'
import React, { useEffect, useRef, useState } from 'react';

const FaceDetection = ({ webcamRef, onFaceDetection }) => {
  const [faceCount, setFaceCount] = useState(0);
  const detectionInterval = useRef(null);
  const modelRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');
  const tfRef = useRef(null);
  const blazefaceRef = useRef(null);
  
  // Load TensorFlow.js and BlazeFace model
  useEffect(() => {
    let isMounted = true;
    
    async function loadModel() {
      try {
        setStatus('Loading TensorFlow.js and BlazeFace model...');
        console.log('Loading TensorFlow.js and BlazeFace model...');
        
        // Dynamically import TensorFlow.js and BlazeFace
        const tf = await import('@tensorflow/tfjs');
        const blazeface = await import('@tensorflow-models/blazeface');
        
        if (!isMounted) return;
        
        tfRef.current = tf;
        blazefaceRef.current = blazeface;
        
        // Initialize TensorFlow.js backend
        await tf.ready();
        console.log('TensorFlow.js ready with backend:', tf.getBackend());
        
        // Load BlazeFace model
        setStatus('Loading face detection model...');
        modelRef.current = await blazeface.load();
        
        console.log('BlazeFace model loaded successfully');
        setStatus('Face detection ready');
      } catch (error) {
        console.error('Error loading models:', error);
        setStatus(`Error: ${error.message}`);
      }
    }
    
    loadModel();
    
    return () => {
      isMounted = false;
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);
  
  // Detect faces when model is loaded and webcam is active
  useEffect(() => {
    if (!modelRef.current || !webcamRef?.current?.video) {
      return;
    }
    
    // Clear any existing interval
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    
    const detectFaces = async () => {
      if (!modelRef.current || !webcamRef.current || !webcamRef.current.video) {
        return;
      }
      
      const video = webcamRef.current.video;
      
      // Check if video is ready
      if (video.readyState !== 4) {
        return;
      }
      
      try {
        // Predict faces
        const predictions = await modelRef.current.estimateFaces(video);
        
        // Update state with number of faces detected
        const faceCount = predictions.length;
        setFaceCount(faceCount);
        setStatus(`Detected: ${faceCount} faces`);
        
        if (onFaceDetection) {
          onFaceDetection(faceCount);
        }
      } catch (error) {
        console.error('Face detection error:', error);
        setStatus(`Error: ${error.message}`);
      }
    };
    
    // Run detection immediately
    detectFaces();
    
    // Set up interval for continuous detection
    detectionInterval.current = setInterval(detectFaces, 500);
    
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [webcamRef, onFaceDetection, modelRef.current]);
  
  return (
    <div className="absolute z-20 px-2 py-1 text-xs text-white rounded bottom-2 left-2 bg-black/50">
      {status}
    </div>
  );
};

export default FaceDetection;