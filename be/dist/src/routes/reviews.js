"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("../controllers/reviews.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/", reviews_controller_1.getAllReviews);
router.get("/event/:eventId", reviews_controller_1.getEventReviews);
// Protected routes
router.post("/", auth_1.authenticate, reviews_controller_1.createReview);
router.get("/user/:userId", auth_1.authenticate, reviews_controller_1.getUserReviews);
router.put("/:reviewId", auth_1.authenticate, reviews_controller_1.updateReview);
router.delete("/:reviewId", auth_1.authenticate, reviews_controller_1.deleteReview);
exports.default = router;
