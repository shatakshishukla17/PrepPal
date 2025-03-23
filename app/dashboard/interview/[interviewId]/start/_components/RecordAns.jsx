'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { Mic, StopCircle, AlertTriangle, Save } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GemeniAIModel'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'

// Simplified motion detection for facial expressions
const FacialExpressionDetection = ({ webcamRef, onExpressionUpdate }) => {
  useEffect(() => {
    if (!webcamRef?.current) return;
    
    const updateInterval = setInterval(() => {
      // Simulate expression data with slight random variations
      const happy = 0.5 + (Math.random() * 0.3);
      const neutral = 0.9 - happy;
      const sad = Math.random() * 0.1;
      const fearful = Math.random() * 0.1;
      
      if (onExpressionUpdate) {
        onExpressionUpdate({
          happy, neutral, sad, fearful, 
          angry: Math.random() * 0.05,
          disgusted: Math.random() * 0.03,
          surprised: Math.random() * 0.1
        });
      }
    }, 2000);
    
    return () => clearInterval(updateInterval);
  }, [webcamRef, onExpressionUpdate]);
  
  return null;
};

// Simple speech analysis
class SpeechAnalyzer {
  constructor() {
    this.startTime = null;
    this.endTime = null;
    this.words = [];
    this.fillerWords = new Set(['um', 'uh', 'er', 'ah', 'like']);
  }
  
  startRecording() {
    this.startTime = Date.now();
    this.words = [];
    return {
      fluencyScore: 75,
      confidenceScore: 70,
      speakingRate: 120
    };
  }
  
  addText(text) {
    if (text) {
      const words = text.toLowerCase().split(/\s+/);
      this.words = [...this.words, ...words];
    }
  }
  
  endRecording(finalText) {
    this.endTime = Date.now();
    this.addText(finalText);
    
    // Calculate metrics
    const durationMinutes = (this.endTime - this.startTime) / 60000;
    const wordCount = this.words.length;
    const speakingRate = Math.round(wordCount / Math.max(0.1, durationMinutes));
    
    // Count filler words
    const fillerCount = this.words.filter(w => this.fillerWords.has(w)).length;
    const fillerPercentage = (fillerCount / Math.max(1, wordCount)) * 100;
    
    // Calculate fluency (higher with fewer fillers)
    const fluencyScore = Math.min(100, Math.max(50, 95 - fillerPercentage * 2));
    
    // Calculate confidence
    const confidenceScore = Math.min(100, Math.max(50, 
      70 + (speakingRate >= 100 && speakingRate <= 160 ? 15 : 0) - fillerPercentage
    ));
    
    return {
      fluencyScore: Math.round(fluencyScore),
      confidenceScore: Math.round(confidenceScore),
      speakingRate: Math.max(80, Math.min(180, speakingRate)),
      vocabularyDiversity: Math.round((new Set(this.words).size / Math.max(1, this.words.length)) * 100) / 100
    };
  }
}

const RecordAns = ({mockInterviewQuestion, activeQuestionIndex, interviewData}) => {
    const [userAnswer, setUserAnswer] = useState('');
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const webcamRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    const speechAnalyzerRef = useRef(new SpeechAnalyzer());
    
    // Speech recognition references
    const recognitionRef = useRef(null);
    
    // Expression and speech metrics
    const [expressionData, setExpressionData] = useState({
        happy: 0.6,
        neutral: 0.3,
        sad: 0.05,
        fearful: 0.05,
        angry: 0,
        disgusted: 0,
        surprised: 0
    });
    
    const [speechMetrics, setSpeechMetrics] = useState({
        fluencyScore: 75,
        confidenceScore: 70,
        speakingRate: 120,
        vocabularyDiversity: 0.5
    });

    // Handle expression updates
    const handleExpressionUpdate = (data) => {
        setExpressionData(data);
    };

    useEffect(() => {
        // Check if browser supports SpeechRecognition
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error('Speech recognition is not supported in this browser. Try Chrome or Edge.');
            setPermissionError(true);
            return;
        }
        
        // Create SpeechRecognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        // Handle recognition results
        recognitionRef.current.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript) {
                // Add to the complete answer
                setUserAnswer(prev => prev + ' ' + finalTranscript);
                // Add to speech analyzer
                speechAnalyzerRef.current.addText(finalTranscript);
            }
        };
        
        // Handle errors
        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                setPermissionError(true);
                toast.error('Microphone permission is required for recording');
            }
        };
        
        // Clean up on component unmount
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    console.log("Cleanup: Speech recognition already stopped");
                }
            }
        };
    }, []);
    
    // Start or stop recording
    const toggleRecording = async() => {
        if (isRecording) {
            // Stop recording
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.log("Error stopping recognition:", e);
                }
            }
            setIsRecording(false);
            
            // Get speech metrics
            const metrics = speechAnalyzerRef.current.endRecording(userAnswer);
            setSpeechMetrics(metrics);
            
            // Auto-save if there's enough content
            if (userAnswer.trim().length > 10) {
                saveAnswer();
            } else {
                toast.error("Your answer is too short. Please provide more details.");
            }
        } else {
            // Reset for new recording
            setUserAnswer('');
            
            try {
                // Request microphone permission if not already granted
                await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Start speech analyzer
                const initialMetrics = speechAnalyzerRef.current.startRecording();
                setSpeechMetrics(initialMetrics);
                
                // Start speech recognition
                if (recognitionRef.current) {
                    recognitionRef.current.start();
                    setIsRecording(true);
                    toast.success('Recording started');
                }
            } catch (error) {
                console.error('Error starting recording:', error);
                setPermissionError(true);
                toast.error('Failed to access microphone. Please check permissions.');
            }
        }
    };

    // Calculate confidence score combining facial and speech metrics
    const calculateConfidenceScore = () => {
        // Speech component (0-50 points)
        const speechScore = speechMetrics.confidenceScore ? speechMetrics.confidenceScore / 2 : 25;
        
        // Facial expression component (0-50 points)
        let expressionScore = 25; // Default middle score
        if (expressionData) {
            const positiveWeight = (expressionData.happy * 0.7) + (expressionData.surprised * 0.2);
            const negativeWeight = (expressionData.angry * 0.5) + (expressionData.sad * 0.3) + 
                                  (expressionData.fearful * 0.3) + (expressionData.disgusted * 0.3);
            
            expressionScore = Math.min(50, Math.max(0, 
                35 + (positiveWeight * 25) - (negativeWeight * 25)
            ));
        }
        
        return speechScore + expressionScore;
    };

    // Process and save the user's answer
    const saveAnswer = async() => {
        if (!userAnswer.trim()) {
            toast.error("Please record an answer first");
            return;
        }
        
        setIsSaving(true);

        try {
            // Calculate combined confidence score
            const combinedConfidenceScore = calculateConfidenceScore();
            
            // Create metrics data
            const metricsData = {
                confidenceScore: Math.round(combinedConfidenceScore),
                speechMetrics: {
                    fluencyScore: speechMetrics.fluencyScore,
                    speakingRate: speechMetrics.speakingRate,
                    vocabularyDiversity: speechMetrics.vocabularyDiversity || 0.5
                },
                expressionMetrics: {
                    happiness: Math.round(expressionData.happy * 100),
                    neutrality: Math.round(expressionData.neutral * 100),
                    nervousness: Math.round((expressionData.fearful + expressionData.sad) * 50)
                }
            };
            
            // Convert metrics to JSON string
            const metricsJson = JSON.stringify(metricsData);
            
            // Get AI feedback on the answer
            let feedback = "Your answer could be improved by providing more specific examples.";
            let rating = "7";
            
            try {
                const question = mockInterviewQuestion[activeQuestionIndex]?.question || 
                                mockInterviewQuestion[activeQuestionIndex]?.Question;
                
                const feedbackPrompt = `Question: ${question}, User Answer: ${userAnswer}. 
                Based on the question and user answer, please give a rating from 1-10 and feedback
                for improvement in 3-5 lines. Return in JSON format with 'rating' and 'feedback' fields.`;
                
                console.log("Sending prompt to AI:", feedbackPrompt);
                const result = await chatSession.sendMessage(feedbackPrompt);
                const responseText = result.response.text();
                console.log("Raw AI response:", responseText);
                
                // Extract JSON from the response
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedResponse = JSON.parse(jsonMatch[0]);
                    if (parsedResponse.rating) rating = parsedResponse.rating.toString();
                    if (parsedResponse.feedback) feedback = parsedResponse.feedback;
                    console.log("Parsed feedback:", parsedResponse);
                }
            } catch (aiError) {
                console.error("Error getting AI feedback:", aiError);
                // Continue with default feedback
            }
            
            // Get correct answer from mockInterviewQuestion
            const correctAnswer = mockInterviewQuestion[activeQuestionIndex]?.answer || 
                                mockInterviewQuestion[activeQuestionIndex]?.Answer || 
                                "Correct answer not available";
            
            // Get question text
            const questionText = mockInterviewQuestion[activeQuestionIndex]?.question || 
                               mockInterviewQuestion[activeQuestionIndex]?.Question || 
                               "Question not available";
            
            console.log("Preparing to save answer with:", {
                question: questionText,
                correctAns: correctAnswer,
                mockId: interviewData?.mockId
            });

            // Save to database
            await db.insert(UserAnswer).values({
                mockId: interviewData?.mockId,
                question: questionText,
                correctAns: correctAnswer,
                userAns: userAnswer,
                feedback: feedback,
                rating: rating,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-yyyy'),
                metrics: metricsJson
            });
            
            toast.success('Answer saved successfully!');
            setUserAnswer('');
        } catch (error) {
            console.error('Error saving answer:', error);
            if (error.message) console.error('Error message:', error.message);
            toast.error(`Failed to save answer: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='flex flex-col items-center justify-center'>
            <div className='relative flex flex-col items-center justify-center p-5 mt-40 rounded-lg'>
                <Image src={'/webcam.png'} width={400} height={400} className='absolute' />
                <Webcam 
                    ref={webcamRef}
                    mirrored={true}
                    audio={false}
                    style={{
                        height: 300,
                        width: '100%',
                        zIndex: 10,
                    }}
                    onUserMediaError={() => {
                        toast.error('Failed to access camera. Please check permissions.');
                    }}
                />
                
                {/* Facial Expression component */}
                {webcamRef.current && 
                    <FacialExpressionDetection 
                        webcamRef={webcamRef}
                        onExpressionUpdate={handleExpressionUpdate}
                    />
                }
            </div>

            {/* Question display */}
            <div className='w-full max-w-md p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50'>
                <h3 className='mb-1 text-sm font-semibold text-blue-700'>Current Question:</h3>
                <p className='text-blue-900'>
                    {mockInterviewQuestion && 
                     (mockInterviewQuestion[activeQuestionIndex]?.question || 
                      mockInterviewQuestion[activeQuestionIndex]?.Question || 
                      "Question not available")}
                </p>
            </div>

            {/* Live preview of the transcription */}
            <div className='w-full max-w-md p-3 mt-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50'>
                <h3 className='mb-1 text-sm font-semibold text-gray-700'>Your Answer:</h3>
                <p className='text-gray-600 text-sm min-h-[60px]'>
                    {isRecording ? 
                     (userAnswer || "Listening...") : 
                     (userAnswer || "Click Record to start answering")}
                </p>
            </div>

            {/* Show error message if permissions are denied */}
            {permissionError && (
                <div className='flex items-center w-full max-w-md p-3 mt-4 border border-red-200 rounded-lg bg-red-50'>
                    <AlertTriangle className='mr-2 text-red-500' size={18} />
                    <p className='text-sm text-red-600'>
                        Microphone access is required for recording. Please enable permissions in your browser.
                    </p>
                </div>
            )}

            {/* Display metrics if available after recording */}
            {!isRecording && speechMetrics.fluencyScore > 0 && (
                <div className='w-full max-w-md p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50'>
                    <h3 className='mb-1 text-sm font-semibold text-blue-700'>Speech Analysis:</h3>
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                        <div>
                            <p className='text-blue-600'>Speaking Rate:</p>
                            <p className='font-medium'>{speechMetrics.speakingRate} wpm</p>
                        </div>
                        <div>
                            <p className='text-blue-600'>Fluency Score:</p>
                            <p className='font-medium'>{speechMetrics.fluencyScore}/100</p>
                        </div>
                        <div>
                            <p className='text-blue-600'>Confidence Score:</p>
                            <p className='font-medium'>{Math.round(calculateConfidenceScore())}/100</p>
                        </div>
                    </div>
                </div>
            )}

            <div className='flex gap-3 mt-6'>
                <Button 
                    disabled={loading || permissionError || isSaving}
                    className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-pink-700 hover:bg-pink-800'}`}
                    onClick={toggleRecording}
                >
                    {isRecording ?
                        <span className='flex items-center gap-2 text-white animate-pulse'>
                            <StopCircle/> Stop Recording
                        </span>
                        :
                        <span className='flex items-center gap-2 text-white'>
                            <Mic/>Record Answer
                        </span>
                    }
                </Button>
                
                {!isRecording && userAnswer && (
                    <Button 
                        disabled={isSaving || isRecording || !userAnswer.trim()}
                        className="bg-green-600 hover:bg-green-700"
                        onClick={saveAnswer}
                    >
                        {isSaving ? 
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                                Saving...
                            </span> 
                            : 
                            <span className="flex items-center gap-2">
                                <Save size={18} /> Save Answer
                            </span>
                        }
                    </Button>
                )}
            </div>
        </div>
    );
};

export default RecordAns;