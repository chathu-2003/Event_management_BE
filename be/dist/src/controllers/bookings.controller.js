"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineBooking = exports.approveBooking = exports.getAllBookings = exports.cancelBooking = exports.getBookingById = exports.getUserBookings = exports.createBooking = void 0;
const booking_model_1 = require("../models/booking.model");
const event_model_1 = require("../models/event.model");
// Create a booking
const createBooking = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { eventId, numberOfTickets, customerName, customerEmail } = req.body;
        // Validation
        if (!eventId || !numberOfTickets || !customerName || !customerEmail) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }
        if (numberOfTickets < 1) {
            return res.status(400).json({
                message: "Number of tickets must be at least 1"
            });
        }
        // Check if event exists
        const event = await event_model_1.Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        // Check if enough seats available
        if (event.availableSeats < numberOfTickets) {
            return res.status(400).json({
                message: `Only ${event.availableSeats} seats available`
            });
        }
        // Calculate total price
        const totalPrice = event.price * numberOfTickets;
        // Create booking - Default status is PENDING (awaiting admin approval)
        const booking = await booking_model_1.Booking.create({
            eventId,
            userId: req.user.sub,
            numberOfTickets,
            totalPrice,
            customerName,
            customerEmail,
            status: booking_model_1.BookingStatus.PENDING
        });
        // Update available seats
        event.availableSeats -= numberOfTickets;
        await event.save();
        res.status(201).json({
            message: "Booking created successfully",
            data: booking
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.createBooking = createBooking;
// Get user's bookings
const getUserBookings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const bookings = await booking_model_1.Booking.find({ userId: req.user.sub })
            .populate("eventId")
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "Bookings fetched successfully",
            data: bookings
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getUserBookings = getUserBookings;
// Get single booking by ID
const getBookingById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { bookingId } = req.params;
        const booking = await booking_model_1.Booking.findById(bookingId).populate("eventId");
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }
        // Check if booking belongs to user
        if (booking.userId.toString() !== req.user.sub) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        res.status(200).json({
            message: "Booking fetched successfully",
            data: booking
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getBookingById = getBookingById;
// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { bookingId } = req.params;
        const booking = await booking_model_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }
        // Check if booking belongs to user
        if (booking.userId.toString() !== req.user.sub) {
            return res.status(403).json({
                message: "Forbidden"
            });
        }
        if (booking.status === booking_model_1.BookingStatus.CANCELLED) {
            return res.status(400).json({
                message: "Booking is already cancelled"
            });
        }
        // Update booking status
        booking.status = booking_model_1.BookingStatus.CANCELLED;
        await booking.save();
        // Restore available seats
        const event = await event_model_1.Event.findById(booking.eventId);
        if (event) {
            event.availableSeats += booking.numberOfTickets;
            await event.save();
        }
        res.status(200).json({
            message: "Booking cancelled successfully",
            data: booking
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.cancelBooking = cancelBooking;
// Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await booking_model_1.Booking.find()
            .populate("eventId")
            .populate("userId", "email firstname lastname")
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: "Bookings fetched successfully",
            data: bookings
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getAllBookings = getAllBookings;
// Approve booking (Admin only)
const approveBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const booking = await booking_model_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.status === booking_model_1.BookingStatus.CONFIRMED) {
            return res.status(400).json({ message: "Booking is already approved" });
        }
        // Get admin details
        const admin = await (await Promise.resolve().then(() => __importStar(require("../models/user.model")))).User.findById(req.user.sub);
        const adminName = admin ? `${admin.firstname} ${admin.lastname}` : "Unknown Admin";
        // Update booking with admin approval info
        booking.status = booking_model_1.BookingStatus.CONFIRMED;
        booking.approvedBy = {
            adminId: req.user.sub,
            adminName,
            approvedAt: new Date()
        };
        await booking.save();
        const populatedBooking = await booking_model_1.Booking.findById(bookingId)
            .populate("eventId")
            .populate("userId", "email firstname lastname");
        res.status(200).json({
            message: "Booking approved successfully",
            data: populatedBooking
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.approveBooking = approveBooking;
// Decline booking (Admin only)
const declineBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const booking = await booking_model_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.status === booking_model_1.BookingStatus.CANCELLED) {
            return res.status(400).json({ message: "Booking is already declined" });
        }
        const previousStatus = booking.status;
        // Get admin details
        const admin = await (await Promise.resolve().then(() => __importStar(require("../models/user.model")))).User.findById(req.user.sub);
        const adminName = admin ? `${admin.firstname} ${admin.lastname}` : "Unknown Admin";
        // Update booking with admin decline info
        booking.status = booking_model_1.BookingStatus.CANCELLED;
        booking.declinedBy = {
            adminId: req.user.sub,
            adminName,
            declinedAt: new Date()
        };
        await booking.save();
        // Restore seats if booking was not already cancelled
        if (previousStatus === booking_model_1.BookingStatus.PENDING || previousStatus === booking_model_1.BookingStatus.CONFIRMED) {
            const event = await event_model_1.Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += booking.numberOfTickets;
                await event.save();
            }
        }
        const populatedBooking = await booking_model_1.Booking.findById(bookingId)
            .populate("eventId")
            .populate("userId", "email firstname lastname");
        res.status(200).json({
            message: "Booking declined successfully",
            data: populatedBooking
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.declineBooking = declineBooking;
