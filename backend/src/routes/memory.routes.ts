import { Router } from "express";

import {
  createMemory,
  deleteMyMemory,
  getAllMemories,
  getMemoryById,
  getMyMemories,
  updateMyMemory,
} from "../controllers/memory.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.get("/", getAllMemories);
router.get("/me", authenticate, getMyMemories);
router.get("/:id", getMemoryById);

router.post("/", authenticate, createMemory);
router.patch("/:id", authenticate, updateMyMemory);
router.delete("/:id", authenticate, deleteMyMemory);

export default router;
