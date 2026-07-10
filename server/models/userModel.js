import mongoose from "mongoose";
import emailValidator from "email-validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
{
    username:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:30
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate:function(){
            const isEmailValid=emailValidator.validate(this.email);

            if(!isEmailValid){
                throw new Error("Please provide a valid email.");
            }

            return isEmailValid;
        }
    },

    password:{
        type:String,
        required:true,
        minlength:8,
        select:false
    },

    profilePicture:{
        type:String,
        default:""
    },

    isVerified:{
        type:Boolean,
        default:false
    }
},
{
    timestamps:true
}
);

userSchema.pre("save",async function(){

    if(!this.isModified("password"))
        return next();

    const salt=await bcrypt.genSalt(10);

    this.password=await bcrypt.hash(this.password,salt);

});

const userModel= mongoose.model('User', userSchema);

export default userModel;