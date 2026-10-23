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
app.use(cookieParser())//use to access and set cookies on the user browser, now we can access cookies from req, res too

//import routes
import userRoutes from "./routes/user.routes.js";

//use routes
app.use("/api/v1/users", userRoutes);

export default app;