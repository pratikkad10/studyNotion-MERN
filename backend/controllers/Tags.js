const Tags = require("../models/Tags");


exports.createTag= async (req, res)=>{
    try {

        const {name,description}=req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All feilds required!",
            })
        }

        const tagDetails=await Tags.create({
            name:name,
            description:description
        })

        res.status(200).json({
            success:true,
            tagDetails:tagDetails,
            message:"Entry created successfully!"
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error in createTag!",
            error:error
        })
    }
}

exports.getAlltags=async (req , res)=>{
    try {
        const allTags= await Tags.find({}, {name:true, description:true});
        res.status(200).json({
            success:true,
            message:"fetched successfully!",
            allTags
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error in getAlltags!",
            error:error
        })
    }
}