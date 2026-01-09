"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const user_model_1 = require("../models/user.model");
const user_model_2 = require("../models/user.model");
const event_model_1 = require("../models/event.model");
const booking_model_1 = require("../models/booking.model");
const router = (0, express_1.Router)();
// Get admin dashboard summary
router.get("/dashboard/summary", auth_1.authenticate, (0, role_1.requireRole)([user_model_1.Role.ADMIN]), async (req, res) => {
    try {
        const totalUsers = await user_model_2.User.countDocuments();
        const totalEvents = await event_model_1.Event.countDocuments();
        const totalBookings = await booking_model_1.Booking.countDocuments();
        const pendingBookings = await booking_model_1.Booking.countDocuments({
            status: booking_model_1.BookingStatus.PENDING
        });
        res.status(200).json({
            totalUsers,
            totalEvents,
            totalBookings,
            pendingBookings
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});
exports.default = router;
