import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';

export const AppContext = createContext();


export const AppContextProvider = (props) => {
     
     axios.defaults.withCredentials = true ;

    const backendUrl = import.meta.env.VITE_BACKEND_URL ;
    const[isLoggedin , setIsLoggedin] = useState(false);
    const [userData , setUserData] = useState(false);

    const getAuthState = async() =>{
      try {
           const {data} = await axios.get(backendUrl + "/api/auth/is-auth");
           if(data.success){
               setIsLoggedin(true);
               getUserData();
           } 
      } catch (error) {
          toast.error(error.message);
      }
    

    }
    
    //getUserData will only be able to get the data , If the user is logged in .
    //How , when a user logs in then a token generate and cookie is created.
    // Hence there is logic in getUserData() on /api/auth/data , the user is find by the userId. Which is 
    // fetched using cookies / middleware. Hence NO Login , NO cookie , Not user found in Db.     
    const getUserData = async() =>{
       try {
           const {data} = await axios.get(backendUrl + "/api/auth/data") ;
           console.log(data);
               data.success ? setUserData(data.userData) : toast.error(data.message);
       } catch (error) {
          toast.error(error.message);
       }   
    
    }
    
    useEffect(()=>{
     getAuthState();
    },[])

    const value = {
          backendUrl,
          isLoggedin , setIsLoggedin ,
          userData , setUserData ,getUserData
    }
  return (
       <AppContext.Provider value={value}>
            {props.children}
       </AppContext.Provider>
  )
}
