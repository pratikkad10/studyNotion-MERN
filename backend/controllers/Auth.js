const User=require('../models/User');
const OTP=require('../models/OTP');
const otpGenerator=require('otp-generator');


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

//login

//change password