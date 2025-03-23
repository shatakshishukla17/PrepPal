'use client'

import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDownIcon, BarChart3Icon, SmileIcon, MehIcon, FrownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const Feedback = ({params}) => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [overallMetrics, setOverallMetrics] = useState({
        averageConfidence: 0,
        averageRating: 0,
        speechMetrics: {
            averageFluency: 0,
            averageSpeakingRate: 0
        },
        expressionMetrics: {
            averageHappiness: 0,
            averageNeutrality: 0,
            averageNervousness: 0
        }
    });
    const router = useRouter();
    
    useEffect(() => {
        GetFeedback();
    }, []);
    
    // Helper function to render confidence icon
    const renderConfidenceIcon = (score) => {
        if (score >= 70) return <SmileIcon className="text-green-500" />;
        if (score >= 40) return <MehIcon className="text-yellow-500" />;
        return <FrownIcon className="text-red-500" />;
    };
    
    const GetFeedback = async() => {
        try {
            console.log("Fetching feedback for interview ID:", params.interviewId);
            const result = await db.select().from(UserAnswer)
                .where(eq(UserAnswer.mockId, params.interviewId))
                .orderBy(UserAnswer.id);
                
            console.log("Fetched results:", result.length);
            
            // Process results with safe parsing of metrics
            const processedResults = result.map(item => {
                try {
                    // Log raw data for debugging
                    console.log("Processing item:", {
                        id: item.id,
                        question: item.question,
                        correctAns: item.correctAns?.substring(0, 30) + "...",
                        userAns: item.userAns?.substring(0, 30) + "...",
                        feedback: item.feedback,
                        rating: item.rating,
                        hasMetrics: !!item.metrics
                    });
                    
                    if (item.metrics && item.metrics !== 'NULL') {
                        // Try to parse the metrics JSON
                        item.parsedMetrics = JSON.parse(item.metrics);
                    } else {
                        // Create default metrics if NULL or invalid
                        item.parsedMetrics = {
                            confidenceScore: 70,
                            speechMetrics: {
                                fluencyScore: 75,
                                speakingRate: 120
                            },
                            expressionMetrics: {
                                happiness: 60,
                                neutrality: 30,
                                nervousness: 10
                            }
                        };
                    }
                    return item;
                } catch (e) {
                    console.warn('Error parsing metrics for item:', item.id, e);
                    // Return with default metrics
                    item.parsedMetrics = {
                        confidenceScore: 70,
                        speechMetrics: {
                            fluencyScore: 75,
                            speakingRate: 120
                        },
                        expressionMetrics: {
                            happiness: 60,
                            neutrality: 30,
                            nervousness: 10
                        }
                    };
                    return item;
                }
            });
                
            setFeedbackList(processedResults);
            
            // Calculate overall metrics only when we have results
            if (processedResults.length > 0) {
                calculateOverallMetrics(processedResults);
            }
        } catch (error) {
            console.error("Error fetching feedback:", error);
        }
    };
    
    // Calculate overall metrics
    const calculateOverallMetrics = (items) => {
        // Calculate average rating
        const totalRating = items.reduce(
            (sum, item) => sum + (parseFloat(item.rating) || 0), 0
        );
        const averageRating = items.length > 0 ? 
            (totalRating / items.length).toFixed(1) : "0.0";
        
        // Calculate average confidence score
        const totalConfidence = items.reduce(
            (sum, item) => sum + (item.parsedMetrics?.confidenceScore || 0), 0
        );
        const averageConfidence = items.length > 0 ? 
            Math.round(totalConfidence / items.length) : 0;
        
        // Calculate speech metrics averages
        let speechItems = 0;
        let totalFluency = 0;
        let totalSpeakingRate = 0;
        
        items.forEach(item => {
            if (item.parsedMetrics?.speechMetrics) {
                speechItems++;
                totalFluency += item.parsedMetrics.speechMetrics.fluencyScore || 0;
                totalSpeakingRate += item.parsedMetrics.speechMetrics.speakingRate || 0;
            }
        });
        
        // Calculate expression metrics averages
        let expressionItems = 0;
        let totalHappiness = 0;
        let totalNeutrality = 0;
        let totalNervousness = 0;
        
        items.forEach(item => {
            if (item.parsedMetrics?.expressionMetrics) {
                expressionItems++;
                totalHappiness += item.parsedMetrics.expressionMetrics.happiness || 0;
                totalNeutrality += item.parsedMetrics.expressionMetrics.neutrality || 0;
                totalNervousness += item.parsedMetrics.expressionMetrics.nervousness || 0;
            }
        });
        
        // Set overall metrics
        setOverallMetrics({
            averageConfidence: averageConfidence,
            averageRating: parseFloat(averageRating),
            speechMetrics: {
                averageFluency: speechItems > 0 ? Math.round(totalFluency / speechItems) : 75,
                averageSpeakingRate: speechItems > 0 ? Math.round(totalSpeakingRate / speechItems) : 120
            },
            expressionMetrics: {
                averageHappiness: expressionItems > 0 ? Math.round(totalHappiness / expressionItems) : 60,
                averageNeutrality: expressionItems > 0 ? Math.round(totalNeutrality / expressionItems) : 30,
                averageNervousness: expressionItems > 0 ? Math.round(totalNervousness / expressionItems) : 10
            }
        });
    };

    return (
        <div className='p-10'>         
            {feedbackList?.length === 0 ? (
                <h2 className='text-xl font-light text-gray-500'>No Interview Feedback Record Found</h2>       
            ) : (
                <>
                    <h2 className='text-3xl font-medium text-slate-900'>Congratulations!</h2>
                    <h2 className='my-2 text-2xl font-light text-gray-900'>Here is your interview feedback</h2>

                    {/* Overall Metrics Dashboard */}
                    <div className="p-6 my-6 border border-blue-200 rounded-lg shadow-md bg-gradient-to-r from-blue-50 to-purple-50">
                        <h2 className='flex items-center mb-4 text-2xl font-medium text-slate-900'>
                            <BarChart3Icon className="mr-2" /> Overall Performance
                        </h2>
                        
                        <div className="grid grid-cols-1 gap-6 mb-4 md:grid-cols-3">
                            {/* Confidence Score */}
                            <div className="p-4 bg-white border border-blue-100 rounded-lg shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-medium text-gray-700">Confidence Score</h3>
                                    {renderConfidenceIcon(overallMetrics.averageConfidence)}
                                </div>
                                <div className="flex items-end">
                                    <span className="text-3xl font-bold text-blue-600">{overallMetrics.averageConfidence}</span>
                                    <span className="ml-1 text-gray-500">/100</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full" 
                                        style={{ width: `${overallMetrics.averageConfidence}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            {/* Technical Rating */}
                            <div className="p-4 bg-white border border-purple-100 rounded-lg shadow">
                                <h3 className="mb-2 text-lg font-medium text-gray-700">Technical Rating</h3>
                                <div className="flex items-end">
                                    <span className="text-3xl font-bold text-purple-600">{overallMetrics.averageRating}</span>
                                    <span className="ml-1 text-gray-500">/10</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div 
                                        className="bg-purple-600 h-2.5 rounded-full" 
                                        style={{ width: `${overallMetrics.averageRating * 10}%` }}
                                    ></div>
                                </div>
                            </div>
                            
                            {/* Speech Fluency */}
                            <div className="p-4 bg-white border border-green-100 rounded-lg shadow">
                                <h3 className="mb-2 text-lg font-medium text-gray-700">Speech Fluency</h3>
                                <div className="flex items-end">
                                    <span className="text-3xl font-bold text-green-600">
                                        {overallMetrics.speechMetrics.averageFluency}
                                    </span>
                                    <span className="ml-1 text-gray-500">/100</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div 
                                        className="bg-green-600 h-2.5 rounded-full" 
                                        style={{ width: `${overallMetrics.speechMetrics.averageFluency}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Detailed Metrics */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Speech Metrics */}
                            <div className="p-4 bg-white border border-blue-100 rounded-lg shadow">
                                <h3 className="mb-3 text-lg font-medium text-gray-700">Speech Analysis</h3>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm">
                                            <span>Speaking Rate</span>
                                            <span className="font-medium">
                                                {overallMetrics.speechMetrics.averageSpeakingRate} wpm
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className="bg-cyan-500 h-1.5 rounded-full" 
                                                style={{ width: `${Math.min(100, overallMetrics.speechMetrics.averageSpeakingRate / 2)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Expression Metrics */}
                            <div className="p-4 bg-white border border-purple-100 rounded-lg shadow">
                                <h3 className="mb-3 text-lg font-medium text-gray-700">Facial Expression Analysis</h3>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm">
                                            <span>Happiness</span>
                                            <span className="font-medium">{overallMetrics.expressionMetrics.averageHappiness}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className="bg-green-500 h-1.5 rounded-full" 
                                                style={{ width: `${overallMetrics.expressionMetrics.averageHappiness}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm">
                                            <span>Neutrality</span>
                                            <span className="font-medium">{overallMetrics.expressionMetrics.averageNeutrality}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className="bg-blue-500 h-1.5 rounded-full" 
                                                style={{ width: `${overallMetrics.expressionMetrics.averageNeutrality}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1 text-sm">
                                            <span>Nervousness</span>
                                            <span className="font-medium">{overallMetrics.expressionMetrics.averageNervousness}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div 
                                                className="bg-orange-500 h-1.5 rounded-full" 
                                                style={{ width: `${overallMetrics.expressionMetrics.averageNervousness}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className='my-3 text-2xl font-light text-cyan-900'>Question-by-question feedback:</h2>
                    <h2 className='text-sm text-gray-500'>Find below interview questions with correct answers, your answers, and feedback for improvement</h2>

                    {feedbackList && feedbackList.map((item, index) => (
                        <Collapsible key={index} className='mt-7'>
                            <CollapsibleTrigger
                                className='flex justify-between w-full p-2 my-2 text-left rounded-lg bg-secondary gap-7'
                            >
                                {item?.question || "Question not available"}
                                <ChevronsUpDownIcon className='w-5 h-5'/>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className='flex flex-col gap-2'>
                                    <h2 className='p-2 text-green-700 bg-green-100 border rounded-lg'>
                                        <strong>Rating: </strong>{item?.rating || "N/A"}
                                    </h2>
                                    
                                    {/* Individual confidence metrics */}
                                    {item.parsedMetrics && (
                                        <div className='flex flex-col gap-2 md:flex-row'>
                                            <div className='flex-1 p-2 text-blue-800 border rounded-lg bg-blue-50'>
                                                <div className="flex items-center justify-between mb-1">
                                                    <strong>Confidence Score: </strong>
                                                    <span className="font-bold">{item.parsedMetrics.confidenceScore}/100</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                                    <div 
                                                        className="h-2 bg-blue-600 rounded-full" 
                                                        style={{ width: `${item.parsedMetrics.confidenceScore}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <h2 className='p-2 text-blue-900 bg-blue-100 border rounded-lg'>
                                        <strong>Your Answer: </strong>{item?.userAns || "No answer recorded"}
                                    </h2>
                                    <h2 className='p-2 text-yellow-900 bg-yellow-100 border rounded-lg'>
                                        <strong>Correct Answer: </strong>{item?.correctAns || "Correct answer not available"}
                                    </h2>
                                    <h2 className='p-2 text-purple-900 bg-purple-100 border rounded-lg'>
                                        <strong>Feedback: </strong>{item?.feedback || "No feedback available"}
                                    </h2>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </>
            )}

            <Button
                onClick={() => router.replace('/dashboard')}
                className='mt-6 bg-slate-800'>
                Go Home
            </Button>
        </div>
    );
};

export default Feedback;