import express from "express";
import { register, login, forgotPassword, resetPassword, verifyToken } from "../controllers/auth.controller";
import { authenticateUser } from "../middleware/authenticateuser.middleware";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/verify-token", authenticateUser, verifyToken);

export default router;
