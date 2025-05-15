import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./db/db.js";


import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import formRoutes from "./routes/formRoutes.js";


dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.Font_End_URL, 
  credentials: true
}));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forms", formRoutes);


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
