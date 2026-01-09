"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.getUserReviews = exports.getEventReviews = exports.getAllReviews = exports.createReview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const review_model_1 = require("../models/review.model");
// Create a review
const createReview = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { eventId, rating, comment } = req.body;
        // Validation
        if (!eventId || !rating || !comment) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }
        if (comment.trim().length < 10) {
            return res.status(400).json({
                message: "Comment must be at least 10 characters"
            });
        }
        // Convert eventId to ObjectId if it's a string
        const eventObjectId = new mongoose_1.default.Types.ObjectId(eventId);
        const review = await review_model_1.Review.create({
            eventId: eventObjectId,
            userId: req.user.sub,
            userName: req.body.userName || "Anonymous",
            rating,
            comment
        });
        // Populate event data before returning
        const populatedReview = await review_model_1.Review.findById(review._id)
            .populate("eventId", "title")
            .populate("userId", "email firstname lastname");
        res.status(201).json({
            message: "Review created successfully",
            data: populatedReview
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.createReview = createReview;
// Get all reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await review_model_1.Review.find()
            .populate("eventId", "title")
            .populate("userId", "email firstname lastname")
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "Reviews fetched successfully",
            data: reviews
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getAllReviews = getAllReviews;
// Get reviews for a specific event
const getEventReviews = async (req, res) => {
    try {
        const { eventId } = req.params;
        const reviews = await review_model_1.Review.find({ eventId })
            .populate("userId", "email firstname lastname")
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "Event reviews fetched successfully",
            data: reviews
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getEventReviews = getEventReviews;
// Get reviews by user
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await review_model_1.Review.find({ userId })
            .populate("eventId", "title")
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "User reviews fetched successfully",
            data: reviews
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getUserReviews = getUserReviews;
// Update a review
const updateReview = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const review = await review_model_1.Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }
        // Check if user owns the review
        if (review.userId.toString() !== req.user.sub) {
            return res.status(403).json({
                message: "You can only update your own reviews"
            });
        }
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }
        if (comment && comment.trim().length < 10) {
            return res.status(400).json({
                message: "Comment must be at least 10 characters"
            });
        }
        if (rating)
            review.rating = rating;
        if (comment)
            review.comment = comment;
        await review.save();
        // Populate event data before returning
        const updatedReview = await review_model_1.Review.findById(review._id)
            .populate("eventId", "title")
            .populate("userId", "email firstname lastname");
        res.status(200).json({
            message: "Review updated successfully",
            data: updatedReview
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.updateReview = updateReview;
// Delete a review
const deleteReview = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { reviewId } = req.params;
        const review = await review_model_1.Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }
        // Check if user owns the review or is admin
        if (review.userId.toString() !== req.user.sub) {
            return res.status(403).json({
                message: "You can only delete your own reviews"
            });
        }
        await review_model_1.Review.findByIdAndDelete(reviewId);
        res.status(200).json({
            message: "Review deleted successfully"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.deleteReview = deleteReview;
