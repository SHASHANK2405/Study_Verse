const bcrypt = require("bcryptjs")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/temp/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()

// send otp 
exports.sendotp = async(req , res) => {
    
    try{
        //fetch email from req
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent) {
            return res.status(401).json({
                success:false,
                message:"User already registered",
            })
        }
        //generate OTP
        var otp = otpGenerator.generate(6 , {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated :",otp);

        //check is otp is unique or not 
        let result = await OTP.findOne({otp:otp});

        while(result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email , otp};

        //create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otp.Body);

        //return response successfull
        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

// sign up
exports.signup = async (req , res) => {

    try{
        //data fetch from req 
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validation of data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success:false,
                message: "All fields are required",
            })
        }

        //2 pass matching
        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:'Password and confirmPassword does not match pls try again ',
            });
        }

        //check user already exists
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });
        }

        //find most recent OTP
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);
        //validate OTP
        if(recentOtp.length === 0) {
            //OTP not found
            return res.status(400).json({
                success:false,
                message:'OTP found',
            })
        }else if(otp !== recentOtp[0].otp) {
            //invalid OTP
            return res.status(400).json({
                success:false,
                message:"invalid OTP",
            });
        }
        //hash pass
        const hashedPassword = await bcrypt.hash(password , 10);

        // Create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)

        //entry create in DB
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType: accountType,
            approved: approved,
            contactNumber,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,      // last check

        })
        //return res
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User can not be registered Please try again",
        })
    }
}


// log in
exports.login = async(req , res) => {
    try{

        //get data from req body
        const {email,password} = req.body;
        //validation data 
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:'all feilds are required to be flled ',
            })
        }

        //user check exist or not 
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registered please sign Up first",
            });
        }
        //generate JWT , after password matching
        if(await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET , {
                expiresIn:"48h",
            });
            user.token = token;
            user.password = undefined;

            //create cookie and sent response
            const options = {
                expiresIn:new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"User Login Success",
            })
        }
        else {
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure , please try again',
        })
    }
};


// change password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}