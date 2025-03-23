import React from 'react'
import Header from './_components/Header'

const DashboardLayout = ({children}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header/>
      <div className='pt-20 mx-5 md:mx-20 lg:mx-36 animate-fadeIn'>
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout