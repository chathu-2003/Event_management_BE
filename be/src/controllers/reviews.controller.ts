import { Request, Response } from "express"
import mongoose from "mongoose"
import { Review } from "../models/review.model"
import { AUthRequest } from "../middleware/auth"

// Create a review
export const createReview = async (req: AUthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { eventId, rating, comment } = req.body

    // Validation
    if (!eventId || !rating || !comment) {
      return res.status(400).json({
        message: "Missing required fields"
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      })
    }

    if (comment.trim().length < 10) {
      return res.status(400).json({
        message: "Comment must be at least 10 characters"
      })
    }

    // Convert eventId to ObjectId if it's a string
    const eventObjectId = new mongoose.Types.ObjectId(eventId)

    const review = await Review.create({
      eventId: eventObjectId,
      userId: req.user.sub,
      userName: req.body.userName || "Anonymous",
      rating,
      comment
    })

    // Populate event data before returning
    const populatedReview = await Review.findById(review._id)
      .populate("eventId", "title")
      .populate("userId", "email firstname lastname")

    res.status(201).json({
      message: "Review created successfully",
      data: populatedReview
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Get all reviews
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find()
      .populate("eventId", "title")
      .populate("userId", "email firstname lastname")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "Reviews fetched successfully",
      data: reviews
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Get reviews for a specific event
export const getEventReviews = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params

    const reviews = await Review.find({ eventId })
      .populate("userId", "email firstname lastname")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "Event reviews fetched successfully",
      data: reviews
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Get reviews by user
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    const reviews = await Review.find({ userId })
      .populate("eventId", "title")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "User reviews fetched successfully",
      data: reviews
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Update a review
export const updateReview = async (req: AUthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { reviewId } = req.params
    const { rating, comment } = req.body

    const review = await Review.findById(reviewId)
    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      })
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user.sub) {
      return res.status(403).json({
        message: "You can only update your own reviews"
      })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      })
    }

    if (comment && comment.trim().length < 10) {
      return res.status(400).json({
        message: "Comment must be at least 10 characters"
      })
    }

    if (rating) review.rating = rating
    if (comment) review.comment = comment

    await review.save()

    // Populate event data before returning
    const updatedReview = await Review.findById(review._id)
      .populate("eventId", "title")
      .populate("userId", "email firstname lastname")

    res.status(200).json({
      message: "Review updated successfully",
      data: updatedReview
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Delete a review
export const deleteReview = async (req: AUthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { reviewId } = req.params

    const review = await Review.findById(reviewId)
    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      })
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== req.user.sub) {
      return res.status(403).json({
        message: "You can only delete your own reviews"
      })
    }

    await Review.findByIdAndDelete(reviewId)

    res.status(200).json({
      message: "Review deleted successfully"
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}
