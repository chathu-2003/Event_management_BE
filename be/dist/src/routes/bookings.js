"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookings_controller_1 = require("../controllers/bookings.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
// Protected routes (authenticated users) - specific routes must come BEFORE parameterized routes
router.post("/", auth_1.authenticate, bookings_controller_1.createBooking);
router.get("/my-bookings", auth_1.authenticate, bookings_controller_1.getUserBookings);
// Admin routes
router.get("/", auth_1.authenticate, (0, role_1.requireRole)([user_model_1.Role.ADMIN]), bookings_controller_1.getAllBookings);
router.patch("/:bookingId/approve", auth_1.authenticate, (0, role_1.requireRole)([user_model_1.Role.ADMIN]), bookings_controller_1.approveBooking);
router.patch("/:bookingId/decline", auth_1.authenticate, (0, role_1.requireRole)([user_model_1.Role.ADMIN]), bookings_controller_1.declineBooking);
router.get("/:bookingId", auth_1.authenticate, bookings_controller_1.getBookingById);
router.delete("/:bookingId", auth_1.authenticate, bookings_controller_1.cancelBooking);
exports.default = router;
