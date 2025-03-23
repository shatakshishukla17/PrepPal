import { UserButton } from '@clerk/nextjs'
import React from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'

const Dashboard = () => {
  return (
    <div className='p-8 bg-white shadow-sm md:p-10 rounded-xl animate-fadeIn'>
      <div className="relative mb-8 overflow-hidden">
        {/* Background decoration elements */}
        <div className="absolute right-0 w-32 h-32 bg-blue-100 rounded-full -top-16 mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute w-40 h-40 bg-pink-100 rounded-full -bottom-8 left-8 mix-blend-multiply filter blur-xl opacity-20"></div>

        <h2 className='relative z-10 text-2xl font-bold text-gray-800'>Welcome to Dashboard</h2>
        <h2 className='relative z-10 mt-1 text-gray-500'>Create and start your AI Mock Interview</h2>
      </div>
      
      <div className='grid grid-cols-1 gap-4 my-5 md:grid-cols-3'>
        <AddNewInterview/>
        <div className="col-span-1 p-8 rounded-lg shadow-sm md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">Interview Tips</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">1</span>
              <p className="text-gray-600">Research the company thoroughly before your interview.</p>
            </li>
            <li className="flex items-start">
              <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">2</span>
              <p className="text-gray-600">Practice the STAR method (Situation, Task, Action, Result) for behavioral questions.</p>
            </li>
            <li className="flex items-start">
              <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">3</span>
              <p className="text-gray-600">Prepare thoughtful questions to ask your interviewer.</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 animate-fadeInUp animation-delay-300">
        <InterviewList/>
      </div>
    </div>
  )
}

export default Dashboard