//Here the connection to mongo takes place.
import mongoose from "mongoose";

export const connectDB = async ()=>{
   
    mongoose.connection.on("connected" , ()=> console.log("Database connected"))

    await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`)
}