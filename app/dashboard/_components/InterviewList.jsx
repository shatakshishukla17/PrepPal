'use client'

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs'
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import InterviewItemCard from './InterviewItemCard';
import { ClipboardList, Loader2 } from 'lucide-react';

const InterviewList = () => {
    const { user } = useUser();
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            GetInterviewList();
        }
    }, [user]);

    const GetInterviewList = async () => {
        try {
            setLoading(true);
            const result = await db.select()
                .from(MockInterview)
                .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress))
                .orderBy(desc(MockInterview.id));

            setInterviewList(result);
        } catch (error) {
            console.error('Error fetching interview list:', error);
        } finally {
            setLoading(false);
        }
    };

    // Animation delay for card list
    const getAnimationDelay = (index) => {
        return `${100 + (index * 50)}ms`;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className='flex items-center text-xl font-medium text-gray-800'>
                    <ClipboardList className="w-5 h-5 mr-2 text-purple-600" />
                    Previous Mock Interviews
                </h2>
                <div className="px-3 py-1 text-sm font-medium text-purple-700 rounded-full bg-purple-50">
                    Total: {interviewList.length}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
            ) : interviewList.length === 0 ? (
                <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
                    <div className="inline-flex items-center justify-center p-3 mb-4 bg-gray-100 rounded-full">
                        <ClipboardList className="w-6 h-6 text-gray-500" />
                    </div>
                    <h3 className="mb-2 font-medium text-gray-700">No interviews yet</h3>
                    <p className="text-sm text-gray-500">Create your first mock interview to get started</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 gap-6 my-3 md:grid-cols-2 lg:grid-cols-3'>
                    {interviewList.map((interview, index) => (
                        <div 
                            key={index} 
                            className="animate-fadeInUp"
                            style={{ animationDelay: getAnimationDelay(index) }}
                        >
                            <InterviewItemCard 
                                interview={interview}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InterviewList;