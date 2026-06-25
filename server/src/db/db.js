import mongoose from 'mongoose'

async function connectDB(){
  try {
   
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};


mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection lost.');
});

export default connectDB;
