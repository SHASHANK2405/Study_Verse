const JWT = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// auth
exports.auth = async (req, res, next) => {
    console.log("_____");
    try {
        console.log("_____");
        // Extract token from cookies, body, or headers
        const token = req.cookies.token 
                    || req.body.token
                    || req.header("Authorization")?.replace("Bearer ", "").trim();

                    console.log("_____");
        // If token is missing, return an error
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is missing',
            });
        }

        console.log("_____");
        // Verify the token
        try {
            console.log("_____");
            console.log("token",token);
            const decoded = JWT.verify(token, process.env.JWT_SECRET);
            console.log("_____");
            console.log("Decoded token:", decoded);
            req.user = decoded;
        } catch (err) {
            // Token verification failed
            return res.status(401).json({
                success: false,
                message: 'Token is invalid hello',
            });
        }
        next();
    } catch (error) {
        // Handle other errors
        console.error("Error in auth middleware:", error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while validating the token',
        });
    }
};

// isStudent
exports.isStudent = async(req , res , next) => {
    try{
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for student only',
            });
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified please try again'
        });
    }
}


// isInstructor
exports.isInstructor = async(req , res , next) => {
    try{
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Instructor only',
            });
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified please try again'
        });
    }
}

// isAdmin
exports.isAdmin = async(req , res , next) => {
    try{
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Admin only',
            });
        }
        next();
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified please try again'
        });
    }
}
