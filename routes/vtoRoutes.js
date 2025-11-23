import express from "express";
import { tryOn } from "../controllers/vtoController.js";

const router = express.Router();

router.post("/tryon", tryOn);

export default router;
