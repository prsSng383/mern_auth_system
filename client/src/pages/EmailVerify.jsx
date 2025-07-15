import React, { useContext, useRef } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const EmailVerify = () => {
   
  axios.defaults.withCredentials = true ; 

  const navigate = useNavigate();
  const {backendUrl , isLoggedin , userData , getUserData} = useContext(AppContext);
  const inputRef = useRef([]);
  console.log(inputRef);
  
  const handelInput = (eve , index) =>{
   

    //Here inputRef.current.length means = the size of whole Array(6) :  _ _ _ _ _ _ length = 6;
    // index will go from 0 to 5.
    // eve.target.value = the number you will put into the UI.
    // eve.target.value.lenght will always be 1 or " " , because <input maxLength="1">.
    // Condition here is  if(user types a number in the UI length becomes 1 && current index < the whole lenght of the array - 1){
    //                                                                                               array ke next elemet par focus karo.}
    // Samajh nhi aaya to inko log krlo .   console.log(inputRef.current.length);
    //                                      console.log(eve , index);
    //                                      console.log(eve.target.value.length);

    if(eve.target.value.length > 0 && index < inputRef.current.length -1){
      inputRef.current[index + 1].focus();
    }
  }

  const onKeyDownHandler = (eve , index) =>{
           if(eve.key === 'Backspace' && eve.target.value === "" && index > 0){
            inputRef.current[index - 1].focus();
           }
  }

  const handelPaste = (eve) =>{
          const paste = eve.clipboardData.getData('text');
          const pasteArray = paste.split('');
          pasteArray.map((ele , index)=>{
            if(inputRef.current[index]){
            inputRef.current[index].value = ele ;
            }})    
  }

  const onSubmitHandler = async(e) =>{
    try {
      e.preventDefault();

      const otpArray = inputRef.current.map((ele)=>ele.value);
      const otp = otpArray.join('');
      console.log(otp);

      const{data} = await axios.post(backendUrl + "/api/auth/verify-account" , {userOtp:otp});
      if(data.success){
        navigate("/");
        toast.success(data.message);
        getUserData();    
      }
    } catch (error) {
         toast.error(error.message);
    }
  }

  useEffect(()=>{
    isLoggedin && userData && userData.isAccountVerified && navigate('/');
  },[isLoggedin , userData])

  return (
     <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
        <img onClick={()=>navigate("/")} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer bg-red-200' />

        <form onSubmit={onSubmitHandler}  className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>

          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP!</h1>

          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>

          <div className='flex justify-between mb-8'>
            {Array(6).fill(0).map((_ ,index)=>(
              <input ref={ (eve) => inputRef.current[index] = eve } onInput={(eve)=>handelInput(eve , index)} onKeyDown={(eve)=>onKeyDownHandler(eve , index)} onPaste={handelPaste} className='text-white w-12 h-12 bg-[#333A5C] text-center text-xl rounded-md' type="text" maxLength="1" key={index} required  />
            ))}
          </div>

          <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Verify email</button>

        </form> 

    </div>
  )
}

export default EmailVerify