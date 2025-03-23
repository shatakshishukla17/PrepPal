'use client'
import React, { useRef, useEffect, useState } from 'react';

/**
 * A simplified facial expression recognition component that:
 * 1. Uses basic motion detection to estimate engagement
 * 2. Simulates emotion detection for demonstration purposes
 * 3. Won't require complex model loading that could fail
 */
const FacialExpressionRecognition = ({ webcamRef, onExpressionUpdate }) => {
  const [isActive, setIsActive] = useState(true);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const previousFrameRef = useRef(null);
  const expressionUpdateIntervalRef = useRef(null);
  
  // Starting values for expressions (simulated)
  const [expressionBaseline, setExpressionBaseline] = useState({
    neutral: 0.6,
    happy: 0.2,
    sad: 0.05,
    angry: 0.05,
    fearful: 0.05,
    disgusted: 0.03,
    surprised: 0.02,
  });

  // Motion detection setup
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    
    // Cleanup function
    return () => {
      setIsActive(false);
      if (expressionUpdateIntervalRef.current) {
        clearInterval(expressionUpdateIntervalRef.current);
      }
    };
  }, []);

  // Set up the analysis loop
  useEffect(() => {
    if (!webcamRef?.current || !canvasRef.current || !isActive) return;
    
    const video = webcamRef.current.video;
    if (!video) return;
    
    // Function to calculate motion between frames
    const detectMotion = () => {
      if (!video || !video.readyState === 4) return 0;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      // Set canvas size to match video
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      
      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get current frame data
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      frameRef.current = currentFrame;
      
      // If we have a previous frame, calculate motion
      let motionScore = 0;
      if (previousFrameRef.current) {
        const prevData = previousFrameRef.current.data;
        const currData = currentFrame.data;
        
        // Compare pixels (simplified - just sample a subset for performance)
        let diffCount = 0;
        const sampleSize = 10000; // Sample size for performance
        const pixelStep = Math.floor(currData.length / 4 / sampleSize);
        
        for (let i = 0; i < currData.length; i += pixelStep * 4) {
          // Calculate absolute difference for RGB values
          const diff = 
            Math.abs(prevData[i] - currData[i]) +
            Math.abs(prevData[i + 1] - currData[i + 1]) +
            Math.abs(prevData[i + 2] - currData[i + 2]);
          
          // If the difference is significant enough
          if (diff > 30) {
            diffCount++;
          }
        }
        
        // Calculate motion as percentage of pixels that changed
        motionScore = diffCount / sampleSize;
      }
      
      // Store current frame as previous for next comparison
      previousFrameRef.current = currentFrame;
      
      return motionScore;
    };
    
    // Simulate expression updates using motion data and random variation
    const updateExpressions = () => {
      const motionScore = detectMotion();
      
      // Copy the baseline expressions
      const newExpressions = { ...expressionBaseline };
      
      // Adjust based on detected motion
      if (motionScore > 0.05) {
        // More motion = more happiness, less neutral
        newExpressions.neutral = Math.max(0.3, expressionBaseline.neutral - motionScore * 0.3);
        newExpressions.happy = Math.min(0.6, expressionBaseline.happy + motionScore * 0.4);
        newExpressions.surprised = Math.min(0.2, expressionBaseline.surprised + motionScore * 0.2);
      } else {
        // Less motion = more neutral, less happiness
        newExpressions.neutral = Math.min(0.8, expressionBaseline.neutral + 0.05);
        newExpressions.happy = Math.max(0.1, expressionBaseline.happy - 0.02);
      }
      
      // Add subtle random variations to make it look more natural
      Object.keys(newExpressions).forEach(key => {
        const randomVariation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
        newExpressions[key] = Math.max(0, Math.min(1, newExpressions[key] + randomVariation));
      });
      
      // Normalize to ensure all values sum to 1
      const sum = Object.values(newExpressions).reduce((a, b) => a + b, 0);
      Object.keys(newExpressions).forEach(key => {
        newExpressions[key] = newExpressions[key] / sum;
      });
      
      // Update the baseline for next time (with smoothing)
      setExpressionBaseline(prev => {
        const smoothed = {};
        Object.keys(prev).forEach(key => {
          smoothed[key] = 0.9 * prev[key] + 0.1 * newExpressions[key];
        });
        return smoothed;
      });
      
      // Send to parent component
      if (onExpressionUpdate) {
        onExpressionUpdate(newExpressions);
      }
    };
    
    // Start the expression update loop - not too frequent to avoid performance issues
    expressionUpdateIntervalRef.current = setInterval(updateExpressions, 1000);
    
    return () => {
      if (expressionUpdateIntervalRef.current) {
        clearInterval(expressionUpdateIntervalRef.current);
      }
    };
  }, [webcamRef, isActive, expressionBaseline, onExpressionUpdate]);
  
  // This component doesn't render anything visible
  return null;
};

export default FacialExpressionRecognition;