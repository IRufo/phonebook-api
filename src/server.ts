import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import contactRoutes from "./routes/contacts.routes";
import "./config/dbSetup";
import initializeAdmin from "./config/initializeAdminUsers";

dotenv.config();
const app = express();

//initialize admin users. 
// Could also be done in postman directly, but we also have to create an endpoint.
initializeAdmin()

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);

// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
