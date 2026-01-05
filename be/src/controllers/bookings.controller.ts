import { Request, Response } from "express"
import { Booking, BookingStatus } from "../models/booking.model"
import { Event } from "../models/event.model"
import { AUthRequest } from "../middleware/auth"

// Create a booking
export const createBooking = async (req: AUthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { eventId, numberOfTickets, customerName, customerEmail } = req.body

    // Validation
    if (!eventId || !numberOfTickets || !customerName || !customerEmail) {
      return res.status(400).json({
        message: "Missing required fields"
      })
    }

    if (numberOfTickets < 1) {
      return res.status(400).json({
        message: "Number of tickets must be at least 1"
      })
    }

    // Check if event exists
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      })
    }

    // Check if enough seats available
    if (event.availableSeats < numberOfTickets) {
      return res.status(400).json({
        message: `Only ${event.availableSeats} seats available`
      })
    }

    // Calculate total price
    const totalPrice = event.price * numberOfTickets

    // Create booking - Default status is PENDING (awaiting admin approval)
    const booking = await Booking.create({
      eventId,
      userId: req.user.sub,
      numberOfTickets,
      totalPrice,
      customerName,
      customerEmail,
      status: BookingStatus.PENDING
    })

    // Update available seats
    event.availableSeats -= numberOfTickets
    await event.save()

    res.status(201).json({
      message: "Booking created successfully",
      data: booking
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Get user's bookings
export const getUserBookings = async (req: AUthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const bookings = await Booking.find({ userId: req.user.sub })
      .populate("eventId")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "Bookings fetched successfully",
      data: bookings
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Get single booking by ID
export const getBookingById = async (req: AUthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { bookingId } = req.params

    const booking = await Booking.findById(bookingId).populate("eventId")

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      })
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== req.user.sub) {
      return res.status(403).json({
        message: "Forbidden"
      })
    }

    res.status(200).json({
      message: "Booking fetched successfully",
      data: booking
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Cancel booking
export const cancelBooking = async (req: AUthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const { bookingId } = req.params

    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      })
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== req.user.sub) {
      return res.status(403).json({
        message: "Forbidden"
      })
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return res.status(400).json({
        message: "Booking is already cancelled"
      })
    }

    // Update booking status
    booking.status = BookingStatus.CANCELLED
    await booking.save()

    // Restore available seats
    const event = await Event.findById(booking.eventId)
    if (event) {
      event.availableSeats += booking.numberOfTickets
      await event.save()
    }

    res.status(200).json({
      message: "Booking cancelled successfully",
      data: booking
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Get all bookings (Admin only)
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate("eventId")
      .populate("userId", "email firstname lastname")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "Bookings fetched successfully",
      data: bookings
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Approve booking (Admin only)
export const approveBooking = async (req: AUthRequest, res: Response) => {
  try {
    const { bookingId } = req.params

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      return res.status(400).json({ message: "Booking is already approved" })
    }

    // Get admin details
    const admin = await (await import("../models/user.model")).User.findById(req.user.sub)
    const adminName = admin ? `${admin.firstname} ${admin.lastname}` : "Unknown Admin"

    // Update booking with admin approval info
    booking.status = BookingStatus.CONFIRMED
    booking.approvedBy = {
      adminId: req.user.sub as any,
      adminName,
      approvedAt: new Date()
    }
    await booking.save()

    const populatedBooking = await Booking.findById(bookingId)
      .populate("eventId")
      .populate("userId", "email firstname lastname")

    res.status(200).json({
      message: "Booking approved successfully",
      data: populatedBooking
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
}

// Decline booking (Admin only)
export const declineBooking = async (req: AUthRequest, res: Response) => {
  try {
    const { bookingId } = req.params

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return res.status(400).json({ message: "Booking is already declined" })
    }

    const previousStatus = booking.status

    // Get admin details
    const admin = await (await import("../models/user.model")).User.findById(req.user.sub)
    const adminName = admin ? `${admin.firstname} ${admin.lastname}` : "Unknown Admin"

    // Update booking with admin decline info
    booking.status = BookingStatus.CANCELLED
    booking.declinedBy = {
      adminId: req.user.sub as any,
      adminName,
      declinedAt: new Date()
    }
    await booking.save()

    // Restore seats if booking was not already cancelled
    if (previousStatus === BookingStatus.PENDING || previousStatus === BookingStatus.CONFIRMED) {
      const event = await Event.findById(booking.eventId)
      if (event) {
        event.availableSeats += booking.numberOfTickets
        await event.save()
      }
    }

    const populatedBooking = await Booking.findById(bookingId)
      .populate("eventId")
      .populate("userId", "email firstname lastname")

    res.status(200).json({
      message: "Booking declined successfully",
      data: populatedBooking
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
}
