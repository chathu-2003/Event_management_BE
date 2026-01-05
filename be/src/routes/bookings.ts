import { Router } from "express"
import { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings, approveBooking, declineBooking } from "../controllers/bookings.controller"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { Role } from "../models/user.model"

const router = Router()

// Protected routes (authenticated users) - specific routes must come BEFORE parameterized routes
router.post("/", authenticate, createBooking)
router.get("/my-bookings", authenticate, getUserBookings)

// Admin routes
router.get("/", authenticate, requireRole([Role.ADMIN]), getAllBookings)
router.patch("/:bookingId/approve", authenticate, requireRole([Role.ADMIN]), approveBooking)
router.patch("/:bookingId/decline", authenticate, requireRole([Role.ADMIN]), declineBooking)

router.get("/:bookingId", authenticate, getBookingById)
router.delete("/:bookingId", authenticate, cancelBooking)

export default router
