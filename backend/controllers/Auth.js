const User=require('../models/User');
const OTP=require('../models/OTP');
const otpGenerator=require('otp-generator');
const bcrypt=require('bcrypt');
const Profile = require('../models/Profile');
const jwt=require('jsonwebtoken');
const mailSender = require('../utils/mailSender');
require('dotenv').config();

//sendOTP
exports.sendOTP = async (req,res)=>{
    try {
        const {email}=req.body;
        const checkUserExists=await User.findOne({email});

        if(checkUserExists){
            return res.status(401).json({
                success:false,
                message:"User already exixts!"
            })
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });

        let result= OTP.findOne({otp: otp});

        if(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            });
        }

        const otpPayload={email, otp};

        const otpBody=await OTP.create(otpPayload);

        res.status(200).json({
            success:true,
            message:"otp sent successfully!",
            otp:otp
        })


    } catch (error) {
        res.status(500).json({
            message:"Internal server error",
            error:error.message
        })
    }
} 

//signup
exports.signup = async (req,res)=>{
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        if(!firstName|| !lastName || !email || !password || !confirmPassword || !accountType || !contactNumber || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"password not matched!",
            })
        }

        const existingUser= await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists!",
            })
        }

        const recentOTP= await OTP.find({email}).sort({createdAt:-1}).limit(1);
        if(recentOTP.length == 0){
            return res.status(400).json({
                success:false,
                message:"OTP not found!",
            })
        }
        else if(otp !== recentOTP){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP!",
            }) 
        }

        const hashedPassword= await bcrypt.hash(password, 10);

        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber
        })

        const newUser= await User.create({firstName,
            lastName,
            email,
            accountType,
            password:hashedPassword,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`
        })

        res.status(200).json({
            success:true,
            message:"User created successfully!",
            user:newUser
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"User cannot Registered!",
            error:error.message
        })
    }
}

//login

exports.login = async (req,res)=>{
    try {
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All feilds required!",
            })
        }

        const user=await User.findOne({email});

        if(!user){
            return res.status(400).json({
                success:false,
                message:"User Not Found!",
            })
        }

        const matchedPassword=await bcrypt.compare(password, user.password);

        if(matchedPassword){
            const payload={
                email:user.email,
                id:user._id,
                role:user.role
            }
            const token=jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h"
            })

            user.token = token;
            user.password=undefined;

            const options={
                expires:new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }
            
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"User logged In successfully!"
            })
        }else{
            return res.status(401).json({
                success:false,
                message:"Password not matched!"
            })
        }

        

        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"User cannot login!",
            error:error.message
        })
    }
}

//change password

exports.changePassword = async (req,res)=>{
    try {
        const user=req.user;
        const {oldPassword, newPassword, confirmPassword}=req.body;
        if(!oldPassword || !newPassword || !confirmPassword){
            return res.status(403).json({
                success:false,
                message:"All feilds required!",
            })
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"New password not matched!",
            })
        }

        const hashedPassword=await bcrypt.hash(newPassword, 10);

        const response=await User.findOneAndUpdate(
            {email:user.email},
            { $set: { password:hashedPassword } },
            { new: true, upsert: true }
        )

        const mail=mailSender(user.email, "Password changed!", "<p>Password updated successfully!</p>");

        res.status(200).json({
            success:true,
            message:"password changed successfully!",
            response,
            mail
        })

        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"cannot change password!",
            error:error.message
        })
    }
}