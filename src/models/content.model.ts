import mongoose from 'mongoose';

export enum ContentType {
    VIDEO = 'video',
    IMAGE = 'image',
    AUDIO = 'audio',
    Article = 'article',
}

const contentSchema = new mongoose.Schema({
    link : {
        type : String,
        required : true,
    },
    type : {
        type : String,
        enum : ContentType,
        required : true,
    },
    title : {
        type : String,
        required : true,
    },
    tags : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'Tag',
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    }
}, {timestamps : true});

const Content = mongoose.model('Content', contentSchema);
export default Content;