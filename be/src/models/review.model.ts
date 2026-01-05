import mongoose, { Document, Schema } from "mongoose"

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  eventId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  userName: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5
    },
    comment: { type: String, required: true, minlength: 10 }
  },
  {
    timestamps: true
  }
)

export const Review = mongoose.model<IReview>("Review", reviewSchema)
