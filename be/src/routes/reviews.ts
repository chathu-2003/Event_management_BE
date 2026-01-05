import { Router } from "express"
import {
  createReview,
  getAllReviews,
  getEventReviews,
  getUserReviews,
  updateReview,
  deleteReview
} from "../controllers/reviews.controller"
import { authenticate } from "../middleware/auth"

const router = Router()

// Public routes
router.get("/", getAllReviews)
router.get("/event/:eventId", getEventReviews)

// Protected routes
router.post("/", authenticate, createReview)
router.get("/user/:userId", authenticate, getUserReviews)
router.put("/:reviewId", authenticate, updateReview)
router.delete("/:reviewId", authenticate, deleteReview)

export default router
