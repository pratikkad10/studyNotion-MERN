const User=require('../models/User');
const OTP=require('../models/OTP');
const otpGenerator=require('otp-generator');
const bcrypt=require('bcrypt');
const Profile = require('../models/Profile');

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

//change password