const mailSender=require('../utils/mailSender');
const User=require('../models/User');
const bcrypt=require('bcrypt');

//resetpasswordToken
exports.resetPasswordToken = async (req, res, next)=>{
    try {
        const email=req.body.email;
        const user = await User.findOne({email});
        if(!user){
            return res.json({
                success:false,
                message:"you are not registered!"
            })
        }

        const token= crypto.randomUUID();

        const updatedDetail=await User.findOneAndUpdate(
            {email:email},
            {
                token:token,
                resetPasswordExpires:Date.now() + 5*60*1000,
            },
            {new:true}
        )

        const url = `http://localhost:3000/update-password/${token}` ;

        await mailSender(email, "Password Reset Link", `<p>Password Reset Link: ${url}</p>`);

        res.json({
            success:true,
            message:"email sent successfully, please check email to change password!"
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error in reset password token!"
        })
    }
}


//resetPassword
exports.resetPassword = async (req, res, next)=>{
    try {
        const {password, confirmPassword, token}=req.body;
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"password not matched!",
            })
        }

        const userDetail=await User.findOne({token});

        if(!userDetail){
            return res.status(400).json({
                success:false,
                message:"Token Invalid!",
            })
        }

        if(userDetail.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"Token Expired!",
            })
        }

        const hashedPassword=await bcrypt.hash(password, 10);

        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword },
            {new:true}
        )

        res.status(200).json({
            success:true,
            message:"password reset successfully!"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error in reset password!"
        })
    }
}