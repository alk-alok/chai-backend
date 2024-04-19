import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.API_KEY_CLOUDINARY, 
  api_secret: process.env.API_SECRET_CLOUDINARY
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file uploaded successfully

        console.log("File uploaded successFully", response.url);
        
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the loclally saved temperarry file as upload failed

        return null;
    }

}


export {uploadOnCloudinary}