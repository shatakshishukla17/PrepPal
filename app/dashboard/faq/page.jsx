'use client';
import React from 'react';
import { Github, Linkedin, ExternalLink, Globe, Mail, Award, Code, Briefcase } from 'lucide-react';

const TeamPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const teamMembers = [
    {
      name: "Shatakshi Shukla",
      role: "MERN Stack Developer",
      imageUrl: "/shatakshi_shukla.jpg",
      bio: "Hi! I am Shatakshi Shukla, a final-year B.Tech CSE student at VIT, passionate about full-stack development, AI/ML, and web automation. I enjoy solving complex problems and building efficient, scalable solutions using a variety of technologies.",
      github: "https://github.com/shatakshishukla17",
      linkedin: "https://www.linkedin.com/in/shatakshishukla17/",
      portfolio: "https://shatakshishukla17.github.io/Shatakshi-Shukla-Portfolio/",
      email:"shatakshi1712@gmail.com",
      skills: ["C++", "Java", "JavaScript", "MongoDB", "Express.js", "React.js", "Node.js", "MySQL", "REST APIs", "OAuth", "Tailwind CSS", "Bootstrap", "HTML"]
    },
    // Add more team members as needed
  ];

  return (
    <div className="min-h-screen px-4 py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black sm:px-6 lg:px-8">
      {/* About Prepal Section */}
      <section className="mx-auto mb-20 max-w-7xl animate-fadeIn">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Prepal</span> Team
          </h1>
          <p className="max-w-3xl mx-auto mt-4 text-xl text-gray-600 dark:text-gray-300">
            We're building the future of interview preparation with AI-powered tools.
          </p>
        </div>

        <div className="overflow-hidden bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-center mb-6 md:justify-start">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-purple-600">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h2 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">About Prepal</h2>
            </div>
            
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Prepal is an innovative AI-powered interview preparation platform designed to help job seekers practice and improve their interview skills. Our platform offers realistic mock interviews, personalized feedback, and intelligent analysis to boost your confidence and performance in real interviews.
            </p>
            
            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-pink-100 rounded-full dark:bg-pink-900">
                  <Award className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Advanced AI Feedback</h3>
                <p className="text-gray-600 dark:text-gray-300">Get personalized feedback on your responses with detailed analysis of your performance.</p>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 rounded-full dark:bg-purple-900">
                  <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Industry-Specific Questions</h3>
                <p className="text-gray-600 dark:text-gray-300">Practice with questions tailored to your specific industry and job role.</p>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full dark:bg-blue-900">
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Accessible Platform</h3>
                <p className="text-gray-600 dark:text-gray-300">Practice anywhere, anytime with our cloud-based platform available on all devices.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="mx-auto max-w-7xl animate-fadeIn animation-delay-200">
        <h2 className="mb-16 text-3xl font-bold text-center text-gray-900 dark:text-white">Our Team</h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="overflow-hidden transition-shadow duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-xl hover:shadow-xl animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                <div className="absolute bottom-0 w-24 h-24 overflow-hidden transform translate-y-1/2 bg-white rounded-full left-6 ring-4 ring-white dark:ring-gray-800 dark:bg-gray-700">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              
              <div className="px-6 pt-16 pb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="mt-1 font-medium text-pink-600 dark:text-pink-400">
                  {member.role}
                </p>
                
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  {member.bio}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  {member.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex mt-6 space-x-3">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-700 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-700 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={member.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-700 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <a
                    href={`mailto:${member.email || 'contact@prepal.com'}`}
                    className="p-2 text-gray-700 transition-colors bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
          
          {/* Add New Team Member Card */}
          <div 
            className="flex items-center justify-center border-2 border-gray-300 border-dashed bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 rounded-xl h-96 animate-fadeIn animation-delay-400"
          >
            <div className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full dark:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">
                Add Team Member
              </h3>
              
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mx-auto mt-24 text-center max-w-7xl animate-fadeIn animation-delay-400">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Ready to collaborate?</h2>
        <p className="max-w-2xl mx-auto mb-8 text-gray-600 dark:text-gray-300">
          We're always looking for new opportunities and partnerships to enhance our platform.
        </p>
        <a 
          href="mailto:shatakshi1712@gmail.com" 
          className="inline-flex items-center px-6 py-3 font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-xl hover:-translate-y-1"
        >
          Get in Touch
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </a>
      </section>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
};

export default TeamPage;