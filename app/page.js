import Image from "next/image";
import { Button } from "@/components/ui/button"
import Header from "./dashboard/_components/Header";
import { Sparkles, Rocket, Trophy, Zap, Laugh, ThumbsUp, Lightbulb } from "lucide-react";
import React from "react";

export default function Home() {
  // Fun emojis for decoration
  const emojis = ["🎯", "🚀", "💡", "🎤", "👨‍💻", "👩‍💻", "🔍", "🏆", "✨", "🎉", "👏", "🙌", "💪", "🤝"];
  
  // Random position generator for floating emojis
  const randomPosition = (index) => {
    return {
      top: `${(index * 7) % 100}%`,
      left: `${(index * 13) % 100}%`,
      animationDelay: `${index * 0.5}s`,
      animationDuration: `${10 + (index % 10)}s`
    };
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <Header />
      
      {/* Floating emoji background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {emojis.map((emoji, index) => (
          <div 
            key={index}
            className="absolute text-4xl select-none opacity-20 animate-float"
            style={randomPosition(index)}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Main hero section */}
      <section className="relative z-10 pt-24 pb-16">
        <div className="container max-w-5xl px-4 mx-auto">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center px-4 py-2 mb-8 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-200 rounded-full animate-bounce">
              <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
              <span>NEW! </span>
              {/* <span className="mx-2">🎉</span> */}
              <span>AI Interview Practice</span>
            </div>
            
            <h1 className="mb-6 text-center">
              <div className="text-5xl font-extrabold tracking-tight text-transparent md:text-6xl bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600">
                Ace Your Next Interview 
              </div>
              <div className="flex flex-wrap items-center justify-center mt-4 text-4xl md:text-5xl">
                <span className="mx-2 text-indigo-600">Like a Pro</span>
                <span className="text-4xl">💯</span>
              </div>
            </h1>
            
            <p className="max-w-2xl mx-auto mb-10 text-xl text-center text-gray-600">
              Practice with our AI interviewer and get instant feedback to land your dream job! No more interview jitters. 
              {/* <span className="inline-block ml-2 animate-pulse"></span> */}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <a 
                href="/dashboard" 
                className="relative group"
              >
                <div className="absolute transition-all duration-200 rounded-lg -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 blur opacity-70 group-hover:opacity-100 group-hover:-inset-2 group-hover:blur-lg"></div>
                <button className="relative flex items-center px-8 py-4 text-lg font-medium text-white transition-all bg-purple-600 rounded-lg group-hover:bg-purple-700">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Practicing 
                  {/* <span className="ml-2"></span> */}
                </button>
              </a>
              
              <a 
                href="#how-it-works" 
                className="relative px-8 py-4 text-lg font-medium transition-all bg-white border-2 border-purple-300 rounded-lg hover:bg-purple-50 hover:border-purple-400"
              >
                <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                  Learn More 
                </span>
                {/* <span className="ml-2">👇</span> */}
              </a>
            </div>
            
            {/* Fun stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              <div className="p-6 transition-all bg-white border border-purple-100 shadow-sm rounded-xl hover:shadow-md">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full">
                  <Trophy className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="mb-1 text-2xl font-bold text-center text-indigo-600">5000+</h3>
                <p className="text-sm text-center text-gray-600">Interview Questions</p>
              </div>
              
              <div className="p-6 transition-all bg-white border border-purple-100 shadow-sm rounded-xl hover:shadow-md">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-pink-100 rounded-full">
                  <Zap className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="mb-1 text-2xl font-bold text-center text-pink-600">15K+</h3>
                <p className="text-sm text-center text-gray-600">Mock Interviews</p>
              </div>
              
              <div className="p-6 transition-all bg-white border border-purple-100 shadow-sm rounded-xl hover:shadow-md">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full">
                  <Laugh className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="mb-1 text-2xl font-bold text-center text-orange-600">95%</h3>
                <p className="text-sm text-center text-gray-600">Confidence Boost</p>
              </div>
              
              <div className="p-6 transition-all bg-white border border-purple-100 shadow-sm rounded-xl hover:shadow-md">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full">
                  <ThumbsUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="mb-1 text-2xl font-bold text-center text-green-600">2X</h3>
                <p className="text-sm text-center text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it works section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container max-w-5xl px-4 mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-800">
              <span className="mr-2">✨</span>
              How It Works
              <span className="ml-2">✨</span>
            </h2>
            <p className="text-gray-600">Three simple steps to interview success</p>
          </div>
          
          <div className="relative">
            {/* Connecting dots */}
            <div className="absolute hidden w-1 left-1/2 top-8 bottom-8 bg-gradient-to-b from-purple-300 to-pink-300 md:block" style={{ transform: 'translateX(-50%)' }}></div>
            
            <div className="space-y-20">
              {/* Step 1 */}
              <div className="md:flex md:items-center">
                <div className="relative flex-1 mb-8 md:mb-0 md:pr-10 md:text-right">
                  <h3 className="mb-2 text-2xl font-bold text-indigo-600">Create Your Interview</h3>
                  <p className="text-gray-600">Just paste a job description and our AI will generate tailored questions.</p>
                </div>
                
                <div className="relative md:mx-auto">
                  <div className="flex items-center justify-center w-16 h-16 text-3xl bg-indigo-100 rounded-full shadow-md">🎯</div>
                </div>
                
                <div className="flex-1 md:pl-10">
                  <div className="mt-4 overflow-hidden rounded-lg bg-indigo-50 md:mt-0">
                    <div className="p-1 bg-indigo-200">
                      <div className="h-2 rounded bg-gradient-to-r from-indigo-300 to-indigo-500 w-[70%]"></div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs italic text-indigo-700">"Looking for a Full Stack Developer with 3+ years experience in React and Node.js..."</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="md:flex md:items-center">
                <div className="flex-1 mb-8 md:mb-0 md:pr-10 md:text-right">
                  <div className="overflow-hidden rounded-lg bg-pink-50">
                    <div className="p-4">
                      <p className="text-xs italic text-pink-700">"Recording answer... discussing my experience with state management in React applications..."</p>
                    </div>
                    <div className="p-1 bg-pink-200">
                      <div className="h-2 rounded bg-gradient-to-r from-pink-300 to-pink-500 w-[60%]"></div>
                    </div>
                  </div>
                </div>
                
                <div className="relative md:mx-auto">
                  <div className="flex items-center justify-center w-16 h-16 text-3xl bg-pink-100 rounded-full shadow-md">🎤</div>
                </div>
                
                <div className="flex-1 md:pl-10">
                  <h3 className="mb-2 text-2xl font-bold text-pink-600">Record Your Answers</h3>
                  <p className="text-gray-600">Use your microphone to respond naturally, just like in a real interview.</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="md:flex md:items-center">
                <div className="flex-1 mb-8 md:mb-0 md:pr-10 md:text-right">
                  <h3 className="mb-2 text-2xl font-bold text-purple-600">Get Smart Feedback</h3>
                  <p className="text-gray-600">Our AI analyzes your responses and gives personalized improvement tips.</p>
                </div>
                
                <div className="relative md:mx-auto">
                  <div className="flex items-center justify-center w-16 h-16 text-3xl bg-purple-100 rounded-full shadow-md">💡</div>
                </div>
                
                <div className="flex-1 md:pl-10">
                  <div className="overflow-hidden rounded-lg bg-purple-50">
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 mr-2 text-center text-white bg-green-500 rounded-full">8</div>
                        <p className="text-sm font-medium text-green-700">Great answer! Here's how to improve:</p>
                      </div>
                      <p className="text-xs text-purple-700">Try adding more specific examples from your previous work...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="py-16 text-center bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
        <div className="container max-w-5xl px-4 mx-auto">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Nail Your Interview? 🚀</h2>
          <p className="max-w-2xl mx-auto mb-8 text-white/90">Stop stressing about interviews and start practicing today!</p>
          
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-purple-700 transition-all bg-white rounded-lg hover:bg-purple-50 hover:scale-105"
          >
            <Lightbulb className="w-5 h-5 mr-2" />
            Start Your Journey
            <span className="ml-2"></span>
          </a>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-white">
        <div className="container px-4 mx-auto text-center">
          <p className="flex items-center justify-center text-gray-600">
            <span>© 2025 PrepPal. All rights reserved.</span>
            <span className="mx-2">|</span>
            <span>Made with</span>
            <span className="mx-1">❤️</span>
            <span>for job seekers</span>
          </p>
        </div>
      </footer>
    </div>
  );
}