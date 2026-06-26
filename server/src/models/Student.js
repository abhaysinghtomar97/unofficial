import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
   

    name: {
      type: String,
      required: true,
    },

    id: {
      type: String,
      
    },

    branch: {
      type: String,
      
    },

    

    section: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      default: "",
    },

    image: {
      type: Date,
      required: true,
    }
  }
);


export default mongoose.model("students", StudentSchema);