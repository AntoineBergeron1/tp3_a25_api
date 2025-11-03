import express from "express";
import { intercepterErreurs } from "../lib/validation.mjs";

import {
  login,
  signup
}  from "../controllers/authController.mjs";

const router = express.Router();

router.post("/login", intercepterErreurs(login));
router.post("/signup", intercepterErreurs(signup));

export default router;

