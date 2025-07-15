import userModel from "../models/userModel.js";


export const getUserData = async(req , res) =>{

         try {
            //will get this userId from the cookie./middleware
            const {userId} = req.body;

            const dbUser = await userModel.findById(userId);
            if(!dbUser) {return res.json({success: false , message :"User not found!"})};

            return res.json({
                success: true,
                userData:{
                    name: dbUser.name,
                    isAccountVerified : dbUser.isAccountVerified
                }

            })
         } catch (error) {
            return res.json({success: false , message: error.message});
         }
}