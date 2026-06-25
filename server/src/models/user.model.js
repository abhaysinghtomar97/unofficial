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
    std_id : Number 
})


const User = mongoose.model('User', userSchema);

export default  User;