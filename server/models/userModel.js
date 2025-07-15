// Defining the user schema

import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required: true
    },

    email:{
        type: String,
        required:true,
        unique: true
    },

    password:{
        type: String,
        required : true
    },
    

    verifyOtp:{
        type: String,
        default: ''
    },
    verifyOtpExpireAt:{
        type: Number,
        default:0
    },
    resetOtp:{
        type : String,
        default: ''    
    },
    resetOtpExpireAt:{
        type : Number,
        default: 0    
    },

    isAccountVerified:{
        type: Boolean,
        default:false
    }
})


// models: use can see it as models:{} object inside mongoose that maintains all the models which have been
// created sofar , So mongoose.models.user will return a true or false based on if the 'user' model exists 
// inside the models:{} object OR will use mongoose.model() function to create a schema with name user and
// store that in models:{
//                        user:{userSchema}     
//                         }
const userModel = mongoose.models.user || mongoose.model('user' , userSchema) ;


export default userModel ;