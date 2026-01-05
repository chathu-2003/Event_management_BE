import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { Role } from "../models/user.model"
import { User } from "../models/user.model"
import { Event } from "../models/event.model"
import { Booking, BookingStatus } from "../models/booking.model"

const router = Router()

// Get admin dashboard summary
router.get(
  "/dashboard/summary",
  authenticate,
  requireRole([Role.ADMIN]),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments()
      const totalEvents = await Event.countDocuments()
      const totalBookings = await Booking.countDocuments()
      const pendingBookings = await Booking.countDocuments({
        status: BookingStatus.PENDING
      })

      res.status(200).json({
        totalUsers,
        totalEvents,
        totalBookings,
        pendingBookings
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        message: "Internal server error"
      })
    }
  }
)

export default router
