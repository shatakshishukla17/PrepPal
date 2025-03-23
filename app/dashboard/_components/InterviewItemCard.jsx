import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'
import { BarChart2, PlayCircle, Calendar, Briefcase, Clock } from 'lucide-react'

const InterviewItemCard = ({interview}) => {
    const router = useRouter();

    const onStart = () => {
        router.push('/dashboard/interview/' + interview?.mockId);
    }

    const onFeedbackPress = () => {
        router.push('/dashboard/interview/' + interview?.mockId + '/feedback');
    }

    return (
        <div className='border border-gray-200 hover:border-gray-300 bg-white shadow-sm hover:shadow rounded-xl p-5 transition-all duration-300 transform hover:scale-[1.02]'>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h2 className='flex items-center gap-2 font-medium text-slate-800'>
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        {interview?.jobPosition}
                    </h2>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1 text-blue-500" />
                        <span>{interview?.jobExperience} Years Experience</span>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1 text-green-500" />
                        <span>Created: {interview?.createdAt}</span>
                    </div>
                </div>
                <div className="bg-blue-50 text-blue-700 text-xs font-medium rounded-full px-2.5 py-1 flex items-center justify-center">
                    Ready
                </div>
            </div>

            <div className='flex justify-between gap-3 mt-5'>
                <Button 
                    size='sm' 
                    className='w-full transition-all shadow-sm bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-md'
                    onClick={onFeedbackPress}
                >
                    <BarChart2 className="w-4 h-4 mr-1" /> 
                    Feedback
                </Button>
                <Button 
                    size='sm' 
                    variant='outline'
                    className='w-full text-purple-700 transition-all border-2 border-purple-200 hover:bg-purple-50 hover:text-purple-800'
                    onClick={onStart}
                >
                    <PlayCircle className="w-4 h-4 mr-1" /> 
                    Start
                </Button>
            </div>
        </div>
    )
}

export default InterviewItemCard