import mongoose from "mongoose";



const userSchema =new mongoose.Schema({
    username: {
        type: Number,
        required  : true
    },
    password : {
        type : String,
        required : true
    },
    college : {
        type : String,
        required : true
    },
    
    loginCount: {
        type: Number,
        default: 1
    },
    lastLogin: Date,
    std_id : Number 
})


const User = mongoose.model('User', userSchema);

export default  User;