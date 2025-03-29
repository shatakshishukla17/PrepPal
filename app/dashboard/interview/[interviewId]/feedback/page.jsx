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

const Feedback = ({ params }) => {
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

    const GetFeedback = async () => {
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

                    {/* Alternative Question-by-question feedback section */}
                    <div className="mt-10 mb-12">
                        <div className="flex flex-col justify-between mb-8 md:flex-row md:items-end">
                            <div>
                                <h2 className='mb-2 text-3xl font-bold text-gray-800'>
                                    Question Feedback
                                    <div className="w-20 h-1 mt-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                </h2>
                                <p className='text-gray-600'>Review your performance on each interview question</p>
                            </div>

                            {/* <div className="flex items-center p-2 mt-4 rounded-lg md:mt-0 bg-indigo-50">
                                <span className="mx-2 text-sm font-medium text-indigo-700">Filter by rating:</span>
                                <select className="px-2 py-1 text-sm text-gray-700 bg-white border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option>All questions</option>
                                    <option>Highest rated</option>
                                    <option>Lowest rated</option>
                                </select>
                            </div> */}
                        </div>

                        <div className="space-y-6">
                            {feedbackList && feedbackList.map((item, index) => (
                                <Collapsible key={index} className='overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl'>
                                    <CollapsibleTrigger className='w-full text-left focus:outline-none'>
                                        <div className='p-5 transition-colors cursor-pointer hover:bg-gray-50'>
                                            <div className="flex flex-col justify-between md:flex-row md:items-center">
                                                <div className="flex items-start gap-4">
                                                    {/* Question number bubble */}
                                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-bold text-white rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                                                        {index + 1}
                                                    </div>

                                                    <div>
                                                        <div className="pr-8 text-lg font-medium text-gray-800 md:pr-0">
                                                            {item?.question || "Question not available"}
                                                        </div>

                                                        {/* Preview of metrics when collapsed */}
                                                        <div className="flex flex-wrap gap-3 mt-2">
                                                            {/* Rating badge */}
                                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                                </svg>
                                                                Rating: {item?.rating || "N/A"}/10
                                                            </div>

                                                            {/* Confidence badge */}
                                                            {item.parsedMetrics && (
                                                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                    </svg>
                                                                    Confidence: {item.parsedMetrics.confidenceScore}%
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center mt-4 md:mt-0">
                                                    <span className="mr-2 text-sm text-gray-500">View details</span>
                                                    <div className="p-1 text-indigo-500 bg-indigo-100 rounded-full">
                                                        <ChevronsUpDownIcon className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <div className="border-t border-gray-100">
                                            <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-y-0 md:divide-x">
                                                {/* Your Answer Panel */}
                                                <div className="p-5">
                                                    <h3 className="flex items-center mb-3 font-semibold text-gray-700">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-blue-600 bg-blue-100 rounded-full">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </span>
                                                        Your Answer
                                                    </h3>
                                                    <div className="p-4 overflow-y-auto text-sm text-gray-700 rounded-lg bg-blue-50 max-h-60">
                                                        {item?.userAns || "No answer recorded"}
                                                    </div>
                                                </div>

                                                {/* Correct Answer Panel */}
                                                <div className="p-5">
                                                    <h3 className="flex items-center mb-3 font-semibold text-gray-700">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-green-600 bg-green-100 rounded-full">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </span>
                                                        Correct Answer
                                                    </h3>
                                                    <div className="p-4 overflow-y-auto text-sm text-gray-700 rounded-lg bg-green-50 max-h-60">
                                                        {item?.correctAns || "Correct answer not available"}
                                                    </div>
                                                </div>

                                                {/* Feedback Panel */}
                                                <div className="p-5">
                                                    <h3 className="flex items-center mb-3 font-semibold text-gray-700">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-purple-600 bg-purple-100 rounded-full">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                            </svg>
                                                        </span>
                                                        AI Feedback
                                                    </h3>
                                                    <div className="p-4 overflow-y-auto text-sm text-gray-700 rounded-lg bg-purple-50 max-h-60">
                                                        {item?.feedback || "No feedback available"}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Performance Metrics */}
                                            {item.parsedMetrics && (
                                                <div className="p-5 border-t border-gray-100">
                                                    <h3 className="flex items-center mb-4 font-semibold text-gray-700">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-indigo-600 bg-indigo-100 rounded-full">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                            </svg>
                                                        </span>
                                                        Performance Metrics
                                                    </h3>

                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                                        {/* Confidence Score */}
                                                        <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg">
                                                            <div className="mb-1 text-sm text-gray-500">Confidence</div>
                                                            <div className="relative w-full h-2 mb-2 bg-gray-200 rounded-full">
                                                                <div
                                                                    className="absolute top-0 left-0 h-full rounded-full"
                                                                    style={{
                                                                        width: `${item.parsedMetrics.confidenceScore}%`,
                                                                        backgroundColor: item.parsedMetrics.confidenceScore >= 70 ? '#10b981' :
                                                                            item.parsedMetrics.confidenceScore >= 50 ? '#3b82f6' :
                                                                                item.parsedMetrics.confidenceScore >= 30 ? '#f59e0b' : '#ef4444'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <div className="text-2xl font-bold">{item.parsedMetrics.confidenceScore}%</div>
                                                        </div>

                                                        {/* Speech Rate */}
                                                        {item.parsedMetrics.speechMetrics?.speakingRate && (
                                                            <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg">
                                                                <div className="mb-1 text-sm text-gray-500">Speaking Rate</div>
                                                                <div className="relative w-full h-2 mb-2 bg-gray-200 rounded-full">
                                                                    <div
                                                                        className="absolute top-0 left-0 h-full bg-teal-500 rounded-full"
                                                                        style={{ width: `${Math.min(100, (item.parsedMetrics.speechMetrics.speakingRate / 180) * 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="text-2xl font-bold">{item.parsedMetrics.speechMetrics.speakingRate}<span className="ml-1 text-sm text-gray-500">WPM</span></div>
                                                            </div>
                                                        )}

                                                        {/* Fluency */}
                                                        {item.parsedMetrics.speechMetrics?.fluencyScore && (
                                                            <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg">
                                                                <div className="mb-1 text-sm text-gray-500">Fluency</div>
                                                                <div className="relative w-full h-2 mb-2 bg-gray-200 rounded-full">
                                                                    <div
                                                                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                                                        style={{ width: `${item.parsedMetrics.speechMetrics.fluencyScore}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="text-2xl font-bold">{item.parsedMetrics.speechMetrics.fluencyScore}<span className="ml-1 text-sm text-gray-500">/100</span></div>
                                                            </div>
                                                        )}

                                                        {/* Technical Rating */}
                                                        <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg">
                                                            <div className="mb-1 text-sm text-gray-500">Technical Rating</div>
                                                            <div className="relative w-full h-2 mb-2 bg-gray-200 rounded-full">
                                                                <div
                                                                    className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                                                                    style={{ width: `${(parseInt(item.rating) / 10) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="text-2xl font-bold">{item.rating}<span className="ml-1 text-sm text-gray-500">/10</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <Button
    onClick={() => router.replace('/dashboard')}
    className="flex items-center justify-center px-6 py-3 mt-8 text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 hover:shadow-lg"
>
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
    Go Home
</Button>
        </div>
    );
};

export default Feedback;