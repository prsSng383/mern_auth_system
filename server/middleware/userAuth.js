import jwt from 'jsonwebtoken'


//This is middleware
// After the execution of userAuth function "next" function will bw called callback concept.
const userAuth = (req ,res,next)=>{
  
  
  try{ const {token} = req.cookies;
   console.log(token);
   console.log(req.cookies);

   
   // if there is no token in the cookie
   if(!token){return res.json({success: false , message:"Not Authorized! Login Again"})};

    // if the cookie exists so use jwt to verify the token using the JWT_SECRET.
    const decodedToken =  jwt.verify(token , process.env.JWT_SECRET);
    console.log(decodedToken);
    if(decodedToken.id){
         if (!req.body) req.body = {};
        req.body.userId = decodedToken.id ;
    }else{
        return res.json({success:false , message:"Not Authorized! Login Again"})
    }
    
    // this will execute the next function . Goto authRoutes and see What is it doing.
    next();
    
   } catch (error) {
    return res.json({success:false , message: error.message})
   }
}

export default userAuth;