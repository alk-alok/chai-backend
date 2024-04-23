import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";



export const verifyJWT = asyncHandler(async (req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token)
        {
            throw new ApiError(401, "Unothorize request!")
        }
    
        const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedTokenInfo?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid access Token")
        }
    
        req.user = user;
        next()
    } catch (err) {
        throw new ApiError(401, err?.message || "Invalid Access Token")
    }
})