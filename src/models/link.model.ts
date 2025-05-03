import mongoose from "mongoose";


const linkSchema = new mongoose.Schema({
    hash: {
        type : String,
        required : true,
        unique : true,
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    contentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Content",
        required : false,
    }
},{timestamps : true});

const Link = mongoose.model("Link", linkSchema);

export default Link;