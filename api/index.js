import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path, { dirname } from 'path';
// import cors from "cors";
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log(`Connected to DB`);

}).catch((err)=>{
    console.log(err);
});

const __dirname= path.resolve();


const app= express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); 

app.use(express.json({ limit: "20mb" })); // Increase the payload size limit to 50MB
app.use(express.urlencoded({ limit: "20mb", extended: true })); // Increase the URL-encoded payload size limit
app.use(
    cors({
        origin: "http://localhost:5173", // Allow requests from this origin
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // Allow cookies to be sent
        maxAge: 86400 // Cache CORS preflight requests for 24 hours

    })
);
// To debug requests, you can add this middleware temporarily:
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    // Don't log body for image uploads as it will flood the console
    if (!req.url.includes('/upload')) {
      console.log('Body:', req.body);
    } else {
      console.log('Body: [Image upload - body content omitted]');
    }
    next();
  });

// Add a global error handler for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error("JSON Parsing Error:", err);
        return res.status(400).json({ success: false, message: "Invalid JSON" });
    }
    next(err);
});

const port= 3000;

app.listen(port,()=>{
    console.log(`app is running on port ${port}`);
});

app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);
app.use('/api/listing',listingRouter);

app.use(express.static(path.join(__dirname,'/client/dist')));

app.get('*',(req,res)=>{
    res.sendFile(path.join(dirname,'client','dist','index.html'));
});

app.use((err,req ,res , next)=>{
    const statusCode= err.statusCode || 500;
    const message= err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});