import { Request, Response } from "express"
import { uploadImageToCloudinary } from "../config/clodinaryconfig"
import { Event, IEvent } from "../models/event.model"

type EventRequest = Request & { file?: Express.Multer.File }

// Get all events with optional filtering
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { category } = req.query

    let query: any = {}

    if (category && category !== "all") {
      query.category = category
    }

    const events = await Event.find(query).sort({ date: 1 })

    res.status(200).json({
      message: "Events fetched successfully",
      data: events
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Get single event by ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params

    const event = await Event.findById(eventId)

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      })
    }

    res.status(200).json({
      message: "Event fetched successfully",
      data: event
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Create event (Admin only)
export const createEvent = async (req: EventRequest, res: Response) => {
  try {
    const { title, description, date, location, price, availableSeats, category } = req.body

    // Validation
    if (
      !title ||
      !description ||
      !date ||
      !location ||
      price === undefined ||
      availableSeats === undefined ||
      !category
    ) {
      return res.status(400).json({
        message: "Missing required fields"
      })
    }

    const parsedPrice = Number(price)
    const parsedSeats = Number(availableSeats)
    const parsedDate = new Date(date)

    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedSeats) || parsedDate.toString() === "Invalid Date") {
      return res.status(400).json({
        message: "Invalid price, availableSeats, or date format"
      })
    }

    let imageUrl: string | undefined = req.body.image

    if (req.file) {
      imageUrl = await uploadImageToCloudinary(req.file.buffer)
    }

    const event = await Event.create({
      title,
      description,
      date: parsedDate,
      location,
      price: parsedPrice,
      availableSeats: parsedSeats,
      category,
      image: imageUrl
    })

    res.status(201).json({
      message: "Event created successfully",
      data: event
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Update event (Admin only)
export const updateEvent = async (req: EventRequest, res: Response) => {
  try {
    const { eventId } = req.params
    const { title, description, date, location, price, availableSeats, category, image } = req.body

    const updateData: Partial<IEvent> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (location !== undefined) updateData.location = location
    if (category !== undefined) updateData.category = category
    if (image !== undefined) updateData.image = image

    if (date !== undefined) {
      const parsedDate = new Date(date)
      if (parsedDate.toString() === "Invalid Date") {
        return res.status(400).json({ message: "Invalid date format" })
      }
      updateData.date = parsedDate
    }

    if (price !== undefined) {
      const parsedPrice = Number(price)
      if (Number.isNaN(parsedPrice)) {
        return res.status(400).json({ message: "Invalid price format" })
      }
      updateData.price = parsedPrice
    }

    if (availableSeats !== undefined) {
      const parsedSeats = Number(availableSeats)
      if (Number.isNaN(parsedSeats)) {
        return res.status(400).json({ message: "Invalid availableSeats format" })
      }
      updateData.availableSeats = parsedSeats
    }

    if (req.file) {
      updateData.image = await uploadImageToCloudinary(req.file.buffer)
    }

    const event = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true
    })

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      })
    }

    res.status(200).json({
      message: "Event updated successfully",
      data: event
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

// Delete event (Admin only)
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params

    const event = await Event.findByIdAndDelete(eventId)

    if (!event) {
      return res.status(404).json({
        message: "Event not found"
      })
    }

    res.status(200).json({
      message: "Event deleted successfully"
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}
