const jwt=require('jsonwebtoken');
const User=require('../models/User');
require('dotenv').config();

//auth
exports.auth = async (req, res, next)=>{
    try {
        const token=req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");

        if(!token){
            return res.status(401).json({
                success:false,
                message:"token missing!",
            })
        }

        try {
            const decode=jwt.verify(token, process.env.JWT_SECRET);
            req.user=decode;
        } catch (error) {
            res.status(500).json({
                success:false,
                message:"token is invalid!",
                error:error.message
            })
        }

        next();

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"something went wrong while validating token !",
            error:error.message
        })
    }
}


//isStudent
exports.isStudent = async (req, res, next)=>{
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for student!"
            })
        }

        next();
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"something went wrong while validating student !",
            error:error.message
        })
    }
}

//isInstructor
exports.isInstructor = async (req, res, next)=>{
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Instructor!"
            })
        }

        next();
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"something went wrong while validating Instructor!",
            error:error.message
        })
    }
}

//isAdmin
exports.isAdmin = async (req, res, next)=>{
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is protected route for Admin!"
            })
        }
9
        next();
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"something went wrong while validating Admin!",
            error:error.message
        })
    }
}
