import mongoose, { Document, Schema } from "mongoose"

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED"
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId
  eventId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  numberOfTickets: number
  totalPrice: number
  status: BookingStatus
  customerName: string
  customerEmail: string
  bookingDate: Date
  approvedBy?: {
    adminId: mongoose.Types.ObjectId
    adminName: string
    approvedAt: Date
  }
  declinedBy?: {
    adminId: mongoose.Types.ObjectId
    adminName: string
    declinedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<IBooking>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    numberOfTickets: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING
    },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now },
    approvedBy: {
      adminId: { type: Schema.Types.ObjectId, ref: "User" },
      adminName: String,
      approvedAt: Date
    },
    declinedBy: {
      adminId: { type: Schema.Types.ObjectId, ref: "User" },
      adminName: String,
      declinedAt: Date
    }
  },
  {
    timestamps: true
  }
)

export const Booking = mongoose.model<IBooking>("Booking", bookingSchema)
