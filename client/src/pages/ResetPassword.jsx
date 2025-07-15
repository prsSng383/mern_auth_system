import React, { useContext, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';


const ResetPassword = () => {
   
  const [email , setEmail] = useState('');
  const navigate = useNavigate();
  const{backendUrl} = useContext(AppContext);
  const inputRef = useRef([]);
  const [otpSend , setOtpSend] = useState(false);
  const [newPassword , setNewPassword] = useState("");

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

  const onSubmitHandlerEmail = async(e) =>{
        e.preventDefault();
        console.log(email);
        try {
            const{data} = await axios.post(backendUrl + "/api/auth/send-reset-otp" , {email});

        if(data.success){
          setOtpSend(true);
          toast.success(data.message);
        }else{
           toast.success(data.message);
        }
        } catch (error) {
           toast.success(error.message);
        }
      

  }

  const onSubmitHandlerOtp = async(e)=>{
      
    try {
      e.preventDefault();
    const otpArray = inputRef.current.map((ele)=>ele.value);
    const otp = otpArray.join('');

    const {data} = await axios.post(backendUrl + "/api/auth/reset-password" , {email , otp , newPassword});

    if(data.success){
      navigate('/login');
      toast.success(data.message);
    }else{
      toast.success(data.message);
    }
      
    } catch (error) {
      toast.success(error.message);
    }
    


  }
  return (
    <div className='bg-red-100 flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
          <img onClick={()=>navigate("/")} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer bg-red-200' />


     {otpSend ? <form onSubmit={onSubmitHandlerOtp} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>

          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password OTP!</h1>

          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>

          <div className='flex justify-between mb-8'>
            {Array(6).fill(0).map((_ ,index)=>(
              <input ref={ (eve) => inputRef.current[index] = eve } onInput={(eve)=>handelInput(eve , index)} onKeyDown={(eve)=>onKeyDownHandler(eve , index)} onPaste={handelPaste} className='text-white w-12 h-12 bg-[#333A5C] text-center text-xl rounded-md' type="text" maxLength="1" key={index} required  />
            ))}
          </div>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] '>
            <img src={assets.mail_icon} alt="" className='w-3 h-3'/>

            <input onChange={(e)=>setEmail(e.target.value)} value={email} required type="email" className='bg-transparent outline-none text-white' placeholder='Email id' />
          </div>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] '>
            <img src={assets.lock_icon} alt="" className='w-3 h-3'/>

            <input onChange={(e)=>setNewPassword(e.target.value)} value={newPassword} required type="password" className='bg-transparent outline-none text-white' placeholder='New-Password' />
          </div>

          <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Submit</button>

      </form> :  <form onSubmit={onSubmitHandlerEmail} className='bg-slate-900  p-8 rounded-lg shadow-lg w-96 text-sm'>
      <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
      <p className='text-indigo-300 mb-6 text-center'>Enter your registered email address.</p>

      <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] '>
        <img src={assets.mail_icon} alt="" className='w-3 h-3'/>

        <input onChange={(e)=>setEmail(e.target.value)} value={email} required type="email" className='bg-transparent outline-none text-white' placeholder='Email id' />
      </div>
    
       <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
    </form>     
 }

    

    

    </div>
  )
}

export default ResetPassword