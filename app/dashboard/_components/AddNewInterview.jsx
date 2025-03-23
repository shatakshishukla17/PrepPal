'use client'

import React, { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LoaderCircle, Plus, BriefcaseIcon, FileTextIcon, CalendarIcon, UploadIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import { chatSession } from '@/utils/GemeniAIModel';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';

const AddNewInterview = () => {
  const[openDailog,setOpenDailog]=useState(false);
  const[jobPosition,setJobPosition]=useState();
  const[jobDesc,setJobDesc]=useState();
  const[jobExperience,setJobExperience]=useState();
  const[loading,setLoading]=useState(false);
  const[jsonResponse,setJsonResponse]=useState([]);
  const router = useRouter();
  const {user}= useUser();
  
  const onSubmit = async(e) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobPosition,jobExperience,jobDesc);
    const InputPromt = "Job Position :"+jobPosition+", job Description:"+jobDesc+", Years of Experience :"+jobExperience+", Depends on this information please give us "+process.env.NEXT_PUBLIC_QUESTION_COUNT+" interview questions with answer in JSON Format ,Give Question and answer as field in JSON"
    const result = await chatSession.sendMessage(InputPromt);
    const MockJsonResp = (result.response.text()).replace('```json','').replace('```','');
    //console.log(await JSON.parse(MockJsonResp));

    setJsonResponse(MockJsonResp);
    
    if(MockJsonResp){
      const resp = await db.insert(MockInterview).values({
        mockId: uuidv4(),
        jsonMockResp: MockJsonResp,
        jobPosition: jobPosition,
        jobDesc: jobDesc,
        jobExperience: jobExperience,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD/MM/yyyy')
      }).returning({mockId:MockInterview.mockId})

      console.log('Inserted Id:', resp);
        
      if(resp){
        setOpenDailog(false);
        router.push('/dashboard/interview/'+ resp[0]?.mockId);
      }
    } else {
      console.log('Error');
    }

    setLoading(false);
  }

  return (
    <div>
      <div 
        className='p-10 transition-all duration-300 transform border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gradient-to-br from-white to-purple-50 hover:shadow-lg hover:scale-105 group'
        onClick={() => setOpenDailog(true)}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="p-3 mb-3 text-white transition-all duration-300 transform rounded-full bg-gradient-to-br from-purple-500 to-pink-500 group-hover:scale-110 group-hover:shadow-md">
            <Plus className="w-6 h-6" />
          </div>
          <h2 className='text-lg font-medium text-center text-gray-700 transition-colors group-hover:text-purple-700'>Add New Interview</h2>
          <p className="mt-2 text-xs text-center text-gray-500">Create a personalized mock interview</p>
        </div>
      </div>

      <AlertDialog open={openDailog}>
        <AlertDialogContent className='max-w-2xl bg-white shadow-xl rounded-xl'>
          <AlertDialogHeader>
            <AlertDialogTitle className='mb-2 text-xl text-gray-800'>Tell us more about your job interview</AlertDialogTitle>
            <AlertDialogDescription>
              <form onSubmit={onSubmit} className="mt-4">
                <h2 className="font-medium text-gray-700">Add details about your job position/role, job description and years of experience</h2>
                
                <div className='mt-6 space-y-6'>
                  <div className='mx-3'>
                    <label className='flex items-center gap-2 mb-2 font-medium text-gray-700'>
                      <BriefcaseIcon className="w-4 h-4 text-purple-600" />
                      Job Role/Job Position
                    </label>
                    <Input 
                      placeholder='Full Stack Developer' 
                      className='mt-1 transition-all border-gray-300 focus:border-purple-500 focus:ring-purple-500' 
                      required
                      onChange={(event) => setJobPosition(event.target.value)}
                    />
                  </div>

                  <div className='mx-3'>
                    <label className='flex items-center gap-2 mb-2 font-medium text-gray-700'>
                      <FileTextIcon className="w-4 h-4 text-purple-600" />
                      Job Description/Tech Stack
                    </label>
                    <Textarea 
                      placeholder='Ex-React, Node.js, Javascript, MongoDB, Next.js etc' 
                      className='mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all min-h-[100px]' 
                      required
                      onChange={(event) => setJobDesc(event.target.value)}
                    />
                  </div>

                  <div className='mx-3'>
                    <label className='flex items-center gap-2 mb-2 font-medium text-gray-700'>
                      <CalendarIcon className="w-4 h-4 text-purple-600" />
                      Years of Experience
                    </label>
                    <Input 
                      placeholder='5' 
                      type="number" 
                      className='mt-1 transition-all border-gray-300 focus:border-purple-500 focus:ring-purple-500' 
                      max='40' 
                      required 
                      onChange={(event) => setJobExperience(event.target.value)}
                    />
                  </div>

                  <div className='mx-3'>
                    <label className='flex items-center gap-2 mb-2 font-medium text-gray-700'>
                      <UploadIcon className="w-4 h-4 text-purple-600" />
                      Upload Resume (Optional)
                    </label>
                    <Input 
                      type="file" 
                      className='mt-1 transition-all border-gray-300 focus:border-purple-500 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100'
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-5'>
                  <AlertDialogFooter className='mt-8'>
                    <AlertDialogCancel 
                      type='button' 
                      className='text-gray-700 transition-all bg-white border-gray-300 hover:bg-gray-50' 
                      onClick={() => setOpenDailog(false)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      type='submit' 
                      disabled={loading} 
                      className='text-white transition-all transform shadow-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-lg'
                    >
                      {loading ?
                        <div className="flex items-center gap-2">
                          <LoaderCircle className='w-5 h-5 animate-spin' />
                          <span>Generating from AI</span>
                        </div> : 
                        'Start Interview'
                      }
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </div>
              </form>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AddNewInterview