const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//resetPassword
exports.resetPasswordToken = async (req , res) => {
    try{
        //get email from req body
        const email = req.body.email;
        //check user for this email , email validation
        const user = await User.findOne({email: email});
        if(!user) {
            return res.json({
                success:false,
                message:'Your email is not registered with us'
            });
        }
        //generate token 
        const token = crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                        {email:email},

                                        {
                                            token:token,
                                            resetPasswordExpires: Date.now() + 5*60*1000,
                                        },
                                        {new:true}
                                    );
        //create URL
        const url = `http://localhost:3000/update-password/${token}`
        //send mail containing the URL
        await mailSender(email,
                        "password Reset Link",
                        `Password Reset Link: ${url}`);
        //return response
        return res.json({
            success:true,
            message:'Email sent successfully , Please check your email and change the password',
        });
    }catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset pwd mail'
        })
    }
}

//resetPassword

exports.resetPassword = async (req , res) => {
    try{
        //data fetch
        const {password , confirmPassword , token} = req.body;
        //validation
        if(password !== confirmPassword){
            return res.json({
                success: false,
                message:'Password not matching '
            }); 
        }
        //get user details from DB by token
        const userDetails = await User.findOne( {token: token});
        //if no entry - invalid token 
        if(!userDetails) {
            return res.json({
                success:false,
                message:'Token is invalid',
            })
        }
        //token time check
        if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}
        //hash pwd
        const hashedPassword = await bcrypt.hash(password , 10);

        //password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        })   
    }catch(error){
        return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
    }
};
