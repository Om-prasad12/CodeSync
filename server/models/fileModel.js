import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
{
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },

    parentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"File",
        default:null
    },

    name:{
        type:String,
        required:true,
        trim:true
    },

    type:{
        type:String,
        enum:["file","folder"],
        required:true
    },

    language:{
        type:String,
        default:"plaintext"
    },
    
    path: {
        type: String,
        required: true
    },

    content:{
        type:String,
        default:""
    }
},
{
    timestamps:true
}
);

export default mongoose.model("File",fileSchema);