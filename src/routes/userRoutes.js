import express from "express";
import { registerController, loginController, logoutController, removeUserController, updateUserDetailsController } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/logout", logoutController);

router.delete("/delete", authMiddleware, removeUserController);

router.put("/update", authMiddleware, updateUserDetailsController);

export default router;



//THIS NEEDS TO BE UPDATED I HAVE DONE THIS SO THE CODE STILL RUNS WITHOUT ERRORS.