"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const events_controller_1 = require("../controllers/events.controller");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const upload_1 = require("../middleware/upload");
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
// Public routes
router.get("/", events_controller_1.getAllEvents);
router.get("/:eventId", events_controller_1.getEventById);
// Admin only routes
router.post("/", auth_1.authenticate, (0, role_1.requireRole)([user_model_1.Role.ADMIN]), upload_1.upload.single("image"), events_controller_1.createEvent);
router.put("/:eventId", auth_1.authenticate, (0, role_1.requireRole)([user_model_1.Role.ADMIN]), upload_1.upload.single("image"), events_controller_1.updateEvent);
router.delete("/:eventId", auth_1.authenticate, (0, role_1.requireRole)([user_model_1.Role.ADMIN]), events_controller_1.deleteEvent);
exports.default = router;
