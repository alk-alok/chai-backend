import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "SOmething wwnt wrong while generating access and refresh Token.")
    }
}



const registerUser = asyncHandler (async (req, res)=>{
    //get user details from frontend
    //validation - empty
    //check if user is exists
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object-> create entry in db
    //remove password and refresh tocken feild from response
    //check user creation
    //return response

    const {fullname, email, username, password} = req.body
    // console.log("\n\n\n Body", req.body)
    if(
        [fullname, email, username, password].some((feild)=>{feild?.trim()===""})
    ){
        throw new ApiError(400, "All feilds are required!")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    // console.log("\n\n\n ExistedUser", existedUser)
    if(existedUser){
        throw new ApiError(409, "Allready exists User!")
    }
    


    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    //-> above line was not worked for if coverImage ws not there


    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
        coverImageLocalPath=req.files.coverImage[0].path
    }
    
    // console.log("\n\n\n Req file", req.files)
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    

    if(!avatar){
        throw new ApiError(400, "Avatar file is required!")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshTocken"
    )
    // console.log("\n\n\n Create User", createdUser)

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully!")
    )

})

const loginUser = asyncHandler(async (req, res)=>{
    //take input from frontend
    //check in database user exists or not
    //check password is correct if exist user
    //generate access and refresh token
    //send cookies

    const {email, username, password} = req.body

    // console.log(email);
    if(!(username || email)){
        throw new ApiError(400, "Username or email is required!")
    }

    const user = await User.findOne({
        $or:[{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exists!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Password is Incorrect!")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("RefreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User loggedIn SuccessFully!"
        )
    )


})

const logoutUser = asyncHandler (async (req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly:true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out!"))
})

const refressAccessToken = asyncHandler ( async (req, res)=>{
    const incomingRefreshToken = cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unothorized request!")
    }

    try {
        const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refreshToken")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired!")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {newaccessToken, newrefreshToken}=await generateAccessAndRefreshToken(user._id)
    
        return res.status(200)
        .cookie("accessToken", newaccessToken, options)
        .cookie("refreshToken", newrefreshToken , options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken: newrefreshToken
                },
                "Access Token refreshed!"
            )
        )
    } catch (err) {
        throw new ApiError(401, err?.message || "Invalid refresh token!")
    }
})


export {registerUser, loginUser, logoutUser, refressAccessToken}