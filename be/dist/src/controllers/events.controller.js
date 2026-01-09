"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getAllEvents = void 0;
const clodinaryconfig_1 = require("../config/clodinaryconfig");
const event_model_1 = require("../models/event.model");
// Get all events with optional filtering
const getAllEvents = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category && category !== "all") {
            query.category = category;
        }
        const events = await event_model_1.Event.find(query).sort({ date: 1 });
        res.status(200).json({
            message: "Events fetched successfully",
            data: events
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getAllEvents = getAllEvents;
// Get single event by ID
const getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await event_model_1.Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        res.status(200).json({
            message: "Event fetched successfully",
            data: event
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getEventById = getEventById;
// Create event (Admin only)
const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, price, availableSeats, category } = req.body;
        // Validation
        if (!title ||
            !description ||
            !date ||
            !location ||
            price === undefined ||
            availableSeats === undefined ||
            !category) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }
        const parsedPrice = Number(price);
        const parsedSeats = Number(availableSeats);
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedPrice) || Number.isNaN(parsedSeats) || parsedDate.toString() === "Invalid Date") {
            return res.status(400).json({
                message: "Invalid price, availableSeats, or date format"
            });
        }
        let imageUrl = req.body.image;
        if (req.file) {
            imageUrl = await (0, clodinaryconfig_1.uploadImageToCloudinary)(req.file.buffer);
        }
        const event = await event_model_1.Event.create({
            title,
            description,
            date: parsedDate,
            location,
            price: parsedPrice,
            availableSeats: parsedSeats,
            category,
            image: imageUrl
        });
        res.status(201).json({
            message: "Event created successfully",
            data: event
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.createEvent = createEvent;
// Update event (Admin only)
const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { title, description, date, location, price, availableSeats, category, image } = req.body;
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (location !== undefined)
            updateData.location = location;
        if (category !== undefined)
            updateData.category = category;
        if (image !== undefined)
            updateData.image = image;
        if (date !== undefined) {
            const parsedDate = new Date(date);
            if (parsedDate.toString() === "Invalid Date") {
                return res.status(400).json({ message: "Invalid date format" });
            }
            updateData.date = parsedDate;
        }
        if (price !== undefined) {
            const parsedPrice = Number(price);
            if (Number.isNaN(parsedPrice)) {
                return res.status(400).json({ message: "Invalid price format" });
            }
            updateData.price = parsedPrice;
        }
        if (availableSeats !== undefined) {
            const parsedSeats = Number(availableSeats);
            if (Number.isNaN(parsedSeats)) {
                return res.status(400).json({ message: "Invalid availableSeats format" });
            }
            updateData.availableSeats = parsedSeats;
        }
        if (req.file) {
            updateData.image = await (0, clodinaryconfig_1.uploadImageToCloudinary)(req.file.buffer);
        }
        const event = await event_model_1.Event.findByIdAndUpdate(eventId, updateData, {
            new: true,
            runValidators: true
        });
        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        res.status(200).json({
            message: "Event updated successfully",
            data: event
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.updateEvent = updateEvent;
// Delete event (Admin only)
const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await event_model_1.Event.findByIdAndDelete(eventId);
        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }
        res.status(200).json({
            message: "Event deleted successfully"
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.deleteEvent = deleteEvent;
