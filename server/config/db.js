import mongoose, { mongo } from "mongoose";

const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI from .env file

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};
export default connectDB;   