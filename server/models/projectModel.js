import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true,
        maxlength:100
    },

    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    collaborators:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ]
},
{
    timestamps:true
}
);

export default mongoose.model("Project",projectSchema);