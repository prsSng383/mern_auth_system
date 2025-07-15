import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

const Home = () => {
  return (
    <div className='bg-[url("/bg_img.png")] bg-cover bg-center flex flex-col items-center justify-center min-h-screen'>
      <Navbar />
      <Header/>
      
    </div>
  )
}

export default Home