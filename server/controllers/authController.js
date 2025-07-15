// In this we are going to make Functions to controll Login , Logout , Signup/Register , VerifyAccount.
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"
import userModel from '../models/userModel.js'
import transporter from '../config/nodemailer.js';

export const register = async (req , res) => {
   const {name , email , password} = req.body
   console.log(req.body);

   if(!name || !email || !password){
    return res.json({success: false , message : "Missing Details"})
   }

   try {
    //Checking if the details from front end to register user , if there is a user already in the Db with same.
    // email id.
    const existingUser = await userModel.findOne({email});

    if(existingUser){
        return res.json({success: false , message: "User Already Exists."})
    }
    // hashing the password that user send from the frontend.
    const hashedPassword = await bcrypt.hash(password , 10) ;

    //Now we have to push this register user to the MongoDB.

    const uesrToBePushed = new userModel({name ,email , password : hashedPassword });
    await uesrToBePushed.save(); // User is created and been stored to the Database.
     console.log(uesrToBePushed._id);
    //Generating TOKEN for Authentication. We will send this token using cookies.
   //user._id DB se aarha h jb bhi vha ek user create hota h usko ek _id milti h user={_id:"gagagdgag"} ese.
    //Imagine karo user login karta hai, to tum is line se ek secure token banate ho jise tum frontend ko bhejte ho.
    // Ye token har future request ke saath bheja jaata hai to prove:
    //"Haan bhai, ye wahi user hai jo login hua tha."
   const token = jwt.sign({id: uesrToBePushed._id},process.env.JWT_SECRET,{expiresIn: '7d'}) ;
    
   // or yeah token ham frontend ko cookie ke through denege.

   res.cookie('token', token , {
      httpOnly : true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
   })
  

   // Sending successfull registered email.
    // these options are needed to be field in the nodemailer's transposter.sendMail(); 
    //Check on nodemailer.com
   const mailOptions = {
      from: process.env.SENDER_EMAIL ,
      to: email,
      subject: `Successfully Registered Welocome ${name}`,
      text: `Welcome to Paras-Auth Website. Your account has been created with email id: ${email}`
   }

   await transporter.sendMail(mailOptions);

      return res.json({success : true , message:"User Registered Successfully"})

   } catch (error) {
      res.json({success: false , message : error.message});
      await userModel.deleteOne({ email: email });

   }

};

export const login = async (req, res) =>{
    
   const {email , password} = req.body;

   if(!email || !password){
      return res.json({success:false , message:"Both email and password are required!"})
   }

   try {
      //if there is a user in DB with the email id received form front end. return true
   const userInDb = await userModel.findOne({email});

   if(!userInDb){return res.json({success:false , message:"Invalid email"})};

   const isPassMatch = await bcrypt.compare(password , userInDb.password) ;

   if(!isPassMatch){return res.json({success:false , message:"Invalid password"})}

      const token = jwt.sign({id : userInDb._id}, process.env.JWT_SECRET ,{expiresIn: '7d'});

      res.cookie('token' , token , {
         httpOnly : true,
         secure: process.env.NODE_ENV === "production",
         sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
         maxAge: 7 * 24 * 60 * 60 * 1000
      })
      
      return res.json({success : true})
       
   } catch (error) {
      return res.json({success:false , message: error.message});
   }
   

};

export const logout = async (req , res) =>{

   try {
      
      res.clearCookie('token',{
         httpOnly : true ,
         secure: process.env.NODE_ENV === "production",
         sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })

      res.json({success:true , message:"Logged Out Successfully"})

   } catch (error) {
      res.json({success:false , message : error.message})
   }
}


//Sending the verification OTP.
export const sendVerifyOtp = async (req, res) =>{
       try {
          // userId will be accessed from jwt token which is stored in the cookies. and middleware will help
          // in doing this.
           const {userId} = req.body;
           if(!userId){return res.json({success:false , message:"userId not fetched"})}
           const user = await userModel.findById(userId);   
          
           if(user.isAccountVerified){
            return res.json({success:false , message:"Account Already Verified."})
           }
            
           const otp = String(Math.floor(100000 + Math.random() * 900000));

           user.verifyOtp = otp;
           user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000 ; 

           await user.save();

           const mailOptions = {
            from: process.env.SENDER_EMAIL , 
            to : user.email,
            subject: "Account Verification OTP.",
            text:`Your OTP is ${otp}. Verify your account using this OTP.`
           }

          await transporter.sendMail(mailOptions);

           res.json({success: true , message:"Verification OTP sent to Email."})

       } catch (error) {
           return res.json({success: false , message: error.message})
       }
}

//Verify email using the OTP.
export const verifyEmail = async(req ,res)=>{
         // userId will be accessed from jwt token which is stored in the cookies.and middleware will help 
         // in doing this.
         // userOtp will be typed by user in the UI.
         const  {userId , userOtp} = req.body;
         if(!userId || !userOtp){
            return res.json({success:false , message: 'Missing Details'});
         }

         try {
             const dbUser = await userModel.findById(userId);

             if(!dbUser){return res.json({success:false , message:"User not found"})}

            if(dbUser.verifyOtp === '' || userOtp !== dbUser.verifyOtp){
               res.json({success:false , message:"Invalid Otp!"})
            }

            if(dbUser.verifyOtpExpireAt < Date.now()){return res.json({success:false , message:"Opt expiresd"})}

            dbUser.isAccountVerified = true;
            dbUser.verifyOtp="";
            dbUser.verifyOtpExpireAt = 0;

            await dbUser.save();
             
               const mailOptions = {
            from: process.env.SENDER_EMAIL , 
            to : dbUser.email,
            subject: "Account Verified.",
            text:`Verification successful.`
           }

          await transporter.sendMail(mailOptions);

          res.json({success: true , message:"Email Verified successfully"});


         } catch (error) {
             res.json({success: false , message: error.message})
         }
        


}

//check if user is authenticated
// It simply Checks if the cookie is generated , When does cookies generate 1. Login 2.Register/SignUpx
// It simply return true after going through the middleware and finding that there exists a token in the cookie.
export const isAuthenticated = async(req ,res) =>{
        try {
         
          return res.json({success:true});

        } catch (error) {
             res.json({success:false, message:error.message})
        }
}


//Sending the OTP for Password Reset
export const sendResetOtp = async(req , res)=>{
           // for reseting the password user needs to give the email.

            const {email} = req.body ;
            console.log(req.body)
            if(!email) {return res.json({success:false , message:"Valid email required!"})}

           try{
            const dbUser = await userModel.findOne({email:email});

            if(!dbUser){return res.json({success:false , message:"User doesn't exists!"})}
           
            const otp = String(Math.round(100000 + Math.random() * 900000));

           dbUser.resetOtp = otp ;
           dbUser.resetOtpExpireAt = Date.now() + 15 * 60 * 1000 ;
           await dbUser.save() ;

            const mailOptions = {
               form: process.env.SENDER_EMAIL ,
               to: dbUser.email,
               subject: "Password Reset OTP",
               text:`Your OTP for reseting the password is ${otp}. Use this OTP to proceed with reseting your password.`
            }

            await transporter.sendMail(mailOptions);

            return res.json({success:true , message:"Otp sent to your email."})

              
           }catch(error){
            res.json({success: false , message:error.message});
           }

}

//Reseting the password
export const resetPassword = async(req, res)=>{
     const {email , otp , newPassword} = req.body;

     if(!email || !otp ||!newPassword){return res.json({success:false , message:"email , otp , newpassword are required!"})};

    try {

      const dbUser = await userModel.findOne({email});
      console.log(dbUser);
      if(!dbUser){return res.json({success:false , message:"User doesnot exists!"})};

      if(dbUser.resetOtp === "" || dbUser.resetOtp !== otp){return res.json({success:false, message:"Invalid Otp"})};

      if(dbUser.resetOtpExpireAt < Date.now()){return res.json({success:false , message:"Otp Expired!" })};
       const hashNewPass = await bcrypt.hash(newPassword , 10);
      dbUser.password = hashNewPass ;
      dbUser.resetOtp="";
      dbUser.resetOtpExpireAt=0;
      await dbUser.save();

      return res.json({success:true , message:"Password Reset Successfully!"});
      
    } catch (error) {
      return res.json({success:false , message:error.message});
    }

}