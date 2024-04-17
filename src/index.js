// require("dotenv").config({path: "./env"});

import dotenv from "dotenv";
import ConnectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config()


ConnectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at PORT : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB Connection fail!!!! \n ", err);
})



/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express"
const app = express();


(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        app.on("error", (error)=>{
            console.log("ERRRR", error)
            throw error
        })

        app.listen(`App is listening on PORT ${process.env.PORT}`);
    }
    catch (error){
        console.log("ERROR: ", error);
        throw error
    }
})()


*/