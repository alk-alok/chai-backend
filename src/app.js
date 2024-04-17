import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";// ye isliye use karte hai jisse ham user ke brwser ki cokkee access kar paye aur unme kuchh chnages kar paye-> basically CRUD operations kar paye

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

export {app};