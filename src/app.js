import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
}))

app.use(express.json({limit: "16kb"}));// will accept the json data
app.use(express.urlencoded({extended: true, limit: "16kb"}));//will encode the url
app.use(express.static("public"));//used to store public assest like pdf file etc. in public folder
app.use(cookieParser())//use to access and set cookies on the user browser

export default app;