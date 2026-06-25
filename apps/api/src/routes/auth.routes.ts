import { Router } from "express";
import { asyncHandler } from "../lib/errors.js";
import * as auth from "../controllers/auth.controller.js";

export const authRouter: Router = Router();

authRouter.post("/register", asyncHandler(auth.register));
authRouter.post("/login", asyncHandler(auth.login));
authRouter.post("/refresh", asyncHandler(auth.refresh));
authRouter.post("/logout", asyncHandler(auth.logout));
