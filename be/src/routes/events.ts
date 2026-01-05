import { Router } from "express"
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from "../controllers/events.controller"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { upload } from "../middleware/upload"
import { Role } from "../models/user.model"

const router = Router()

// Public routes
router.get("/", getAllEvents)
router.get("/:eventId", getEventById)

// Admin only routes
router.post("/", authenticate, requireRole([Role.ADMIN]), upload.single("image"), createEvent)
router.put("/:eventId", authenticate, requireRole([Role.ADMIN]), upload.single("image"), updateEvent)
router.delete("/:eventId", authenticate, requireRole([Role.ADMIN]), deleteEvent)

export default router
