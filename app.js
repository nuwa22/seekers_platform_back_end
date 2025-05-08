import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./db/db.js";

// Route imports
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import formRoutes from "./routes/formRoutes.js";
 // ✅ Import your IO document routes

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",  // Adjust if frontend is hosted elsewhere
  credentials: true
}));
app.use(express.json());

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forms", formRoutes);


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
