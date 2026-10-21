import "dotenv/config";
import connectDB from "./db/db.js";
import app from "./app.js";

connectDB()
.then(() => {
  app.on("error", (error) => {
    console.log(`Error`, error);
    throw Error;
  })
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  })
})
.catch((error) => {
  console.log(`MongoDB connection failed`);
})