'use client'
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db.js'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, WebcamIcon, BriefcaseIcon, CodeIcon, ClockIcon, AlertTriangle, X, Users } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState, useRef } from 'react'
import Webcam from "react-webcam";

const Interview = ({params}) => {
  const [interviewData, setInterviewData] = useState();
  const [webCamEnable, setWebCamEnable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [multiplePersonsDetected, setMultiplePersonsDetected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const prevFrameRef = useRef(null);
  const detectionInterval = useRef(null);
  const activeRegionsRef = useRef([]);
  
  useEffect(() => {
    console.log(params.interviewId)
    GetInterviewDetails();
    
    // Create canvas for processing
    canvasRef.current = document.createElement('canvas');
    
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    };
  }, []);

  const GetInterviewDetails = async() => {
    setLoading(true);
    const result = await db.select().from(MockInterview).where(eq(MockInterview.mockId, params.interviewId))
    setInterviewData(result[0]);
    setLoading(false);
  }
  
  // Start motion detection when webcam is enabled
  useEffect(() => {
    if (!webCamEnable || !webcamRef.current) {
      return;
    }
    
    // Stop any existing interval
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    
    // Function to detect motion in different regions
    const detectMotion = () => {
      if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
        return;
      }
      
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get current frame data
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // If we don't have a previous frame, save this one and return
      if (!prevFrameRef.current) {
        prevFrameRef.current = currentFrame;
        return;
      }
      
      // Define regions (3x2 grid)
      const regions = [];
      const gridX = 3;
      const gridY = 2;
      
      for (let y = 0; y < gridY; y++) {
        for (let x = 0; x < gridX; x++) {
          regions.push({
            x: Math.floor(canvas.width * (x / gridX)),
            y: Math.floor(canvas.height * (y / gridY)),
            width: Math.floor(canvas.width / gridX),
            height: Math.floor(canvas.height / gridY),
            active: false
          });
        }
      }
      
      // Check for motion in each region
      regions.forEach((region, index) => {
        let motionCount = 0;
        let pixelsChecked = 0;
        
        // Sample pixels in this region (every 8th pixel for performance)
        for (let y = 0; y < region.height; y += 8) {
          for (let x = 0; x < region.width; x += 8) {
            const pixelX = region.x + x;
            const pixelY = region.y + y;
            
            // Calculate position in data array (each pixel is 4 values: r,g,b,a)
            const i = ((pixelY * canvas.width) + pixelX) * 4;
            
            // Get color difference between frames
            const rdiff = Math.abs(currentFrame.data[i] - prevFrameRef.current.data[i]);
            const gdiff = Math.abs(currentFrame.data[i+1] - prevFrameRef.current.data[i+1]);
            const bdiff = Math.abs(currentFrame.data[i+2] - prevFrameRef.current.data[i+2]);
            
            // Sum the differences
            const diff = rdiff + gdiff + bdiff;
            
            // If difference is above threshold, count it as motion
            if (diff > 100) {
              motionCount++;
            }
            
            pixelsChecked++;
          }
        }
        
        // Calculate motion percentage in this region
        const motionPercentage = (motionCount / pixelsChecked) * 100;
        
        // Mark region as active if motion percentage is above threshold
        regions[index].active = motionPercentage > 10; // 10% threshold for significant motion
      });
      
      // Store current frame as previous frame for next comparison
      prevFrameRef.current = currentFrame;
      
      // Count active regions
      const activeRegions = regions.filter(r => r.active);
      activeRegionsRef.current = activeRegions;
      
      // Check if we have motion in multiple separated regions (not adjacent)
      // This is a simple heuristic for "multiple people"
      let multiplePeople = false;
      
      if (activeRegions.length >= 2) {
        // Check if the active regions are on opposite sides (more likely to be multiple people)
        const leftSide = activeRegions.filter(r => r.x < canvas.width / 2);
        const rightSide = activeRegions.filter(r => r.x >= canvas.width / 2);
        
        // If we have activity on both sides, likely multiple people
        if (leftSide.length > 0 && rightSide.length > 0) {
          multiplePeople = true;
        }
      }
      
      // Update state if multiple people detected
      if (multiplePeople) {
        setMultiplePersonsDetected(true);
        setShowAlert(true);
      } else {
        setMultiplePersonsDetected(false);
      }
    };
    
    // Set up detection interval
    detectionInterval.current = setInterval(detectMotion, 200); // Check 5 times per second
    
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    };
  }, [webCamEnable, webcamRef]);

  // For presentation to see if detection is working
  const renderDebugView = () => {
    if (!webCamEnable || activeRegionsRef.current.length === 0) return null;
    
    return (
      <div className="absolute z-20 px-2 py-1 text-xs text-white rounded bottom-2 left-2 bg-black/70">
        Active regions: {activeRegionsRef.current.length} 
        {multiplePersonsDetected && " (Multiple people detected)"}
      </div>
    );
  };

  return (
    <div className='px-4 my-10 animate-fadeIn'>
      <div className="relative mb-8">
        <h2 className='relative z-10 text-2xl font-bold text-gray-800'>
          Let's get Started
          <div className="absolute bottom-0 left-0 w-12 h-2 bg-pink-500 rounded-full opacity-70"></div>
        </h2>
        <p className="mt-2 text-gray-500">Prepare for your interview simulation</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-b-2 border-pink-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
            <div className='flex flex-col gap-5 my-5'>
              <div className='flex flex-col gap-5 p-6 my-5 transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md'>
                <div className="flex items-start">
                  <div className="p-2 mr-3 bg-pink-100 rounded-full">
                    <BriefcaseIcon className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className='mb-1 text-sm font-medium text-gray-500'>Job Role/Position</h3>
                    <p className='text-lg font-medium text-gray-800'>{interviewData?.jobPosition}</p>
                  </div>
                </div>
                
                <div className="w-full h-px bg-gray-100"></div>
                
                <div className="flex items-start">
                  <div className="p-2 mr-3 bg-blue-100 rounded-full">
                    <CodeIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className='mb-1 text-sm font-medium text-gray-500'>Job Description/Tech Stack</h3>
                    <p className='text-lg font-medium text-gray-800'>{interviewData?.jobDesc}</p>
                  </div>
                </div>
                
                <div className="w-full h-px bg-gray-100"></div>
                
                <div className="flex items-start">
                  <div className="p-2 mr-3 bg-purple-100 rounded-full">
                    <ClockIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className='mb-1 text-sm font-medium text-gray-500'>Years of Experience</h3>
                    <p className='text-lg font-medium text-gray-800'>{interviewData?.jobExperience}</p>
                  </div>
                </div>
              </div>

              <div className='p-6 border rounded-lg shadow-sm bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className="p-2 rounded-full bg-amber-100">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className='font-semibold text-slate-800'>Important Information</h3>
                </div>
                <div className="p-4 bg-white border rounded-lg bg-opacity-80 border-slate-100">
                  <p className='text-slate-700'>{process.env.NEXT_PUBLIC_INFORMATION || "Prepare for your interview by using the webcam and microphone features to practice your responses."}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="relative flex-1 p-6 bg-white border border-gray-200 rounded-lg shadow-sm animate-fadeInRight">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700">Camera Preview</h3>
                  {webCamEnable && (
                    <div className={`flex items-center text-xs px-2 py-1 rounded ${
                      multiplePersonsDetected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      <Users className="w-3 h-3 mr-1" />
                      {multiplePersonsDetected ? 'Multiple people' : 'Single person'} detected
                    </div>
                  )}
                </div>
                
                {webCamEnable ? (
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-lg ${
                      multiplePersonsDetected 
                        ? 'bg-red-500/10 border-2 border-red-500 animate-pulse' 
                        : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20'
                    }`}></div>
                    <Webcam 
                      ref={webcamRef}
                      onUserMedia={() => setWebCamEnable(true)}
                      onUserMediaError={() => setWebCamEnable(false)}
                      mirrored={true}
                      style={{width: '100%', height: 300}}
                      className="relative z-10 rounded-lg shadow-md"
                    />
                    
                    {/* Debug info */}
                    {renderDebugView()}
                    
                    {/* Proctoring Alert */}
                    {showAlert && multiplePersonsDetected && (
                      <div className="absolute top-0 left-0 right-0 z-20 p-3 text-white bg-red-500 rounded-t-lg animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            <span className="font-medium">Multiple people detected!</span>
                          </div>
                          <button 
                            onClick={() => setShowAlert(false)}
                            className="p-1 bg-red-600 rounded-full hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-sm">Only one person should be visible during the interview.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-full max-w-sm p-6 mb-6 bg-gray-100 rounded-lg aspect-square">
                      <WebcamIcon className='w-1/2 text-gray-400 h-1/2 animate-pulse-slow' />
                    </div>
                    <Button 
                      onClick={() => setWebCamEnable(true)} 
                      className='transition-all shadow-sm bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 hover:shadow'
                    >
                      Enable Web Cam and Microphone
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="pt-6 mt-auto">
                <Link href={'/dashboard/interview/' + params.interviewId + '/start'} className="w-full">
                  <Button 
                    className='w-full py-6 text-lg transition-all shadow-md bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 hover:shadow-lg'
                    disabled={loading || multiplePersonsDetected}
                  >
                    {multiplePersonsDetected ? 'Please Fix Camera View' : 'Start Interview'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Interview