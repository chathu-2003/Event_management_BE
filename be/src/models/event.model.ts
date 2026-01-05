import mongoose, { Document, Schema } from "mongoose"

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description: string
  date: Date
  location: string
  price: number
  availableSeats: number
  category: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    image: { type: String }
  },
  {
    timestamps: true
  }
)

export const Event = mongoose.model<IEvent>("Event", eventSchema)
