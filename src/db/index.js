import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const ConnectDB = async ()=>{
    console.log("MongoDB " , process.env.MONGODB_URL)
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB Connceted !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection error: ", error)
        process.exit(1)
    }
}

export default ConnectDB;