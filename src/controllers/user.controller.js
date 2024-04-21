import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler (async (req, res)=>{
    //get user details from frontend
    //validation - empty
    //check if user is exists
    //check for images, check for avatar
    //upload them to cloudinary, avtar
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

export {registerUser}