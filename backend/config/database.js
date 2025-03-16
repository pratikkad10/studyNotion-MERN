const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("DB connected successfully"))
    .catch((e)=> {
        console.log("DB connection failed ", e);
        process.exit(1);
    })
};
