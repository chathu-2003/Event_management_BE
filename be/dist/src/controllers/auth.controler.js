"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getAllUsers = exports.refreshToken = exports.getMyProfile = exports.registerAdmin = exports.login = exports.registerUser = void 0;
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const tokens_1 = require("../utils/tokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const registerUser = async (req, res) => {
    try {
        const { email, password, firstname, lastname } = req.body;
        // left email form model, right side data varible
        //   User.findOne({ email: email })
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email exists" });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        //   new User()
        const user = await user_model_1.User.create({
            email,
            firstname,
            lastname,
            password: hash,
            roles: [user_model_1.Role.USER]
        });
        res.status(201).json({
            message: "User registed",
            data: { email: user.email, roles: user.roles }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal; server error"
        });
    }
};
exports.registerUser = registerUser;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = (await user_model_1.User.findOne({ email }));
        if (!existingUser) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const valid = await bcryptjs_1.default.compare(password, existingUser.password);
        if (!valid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const accessToken = (0, tokens_1.signAccessToken)(existingUser);
        const refreshToken = (0, tokens_1.signRefreshToken)(existingUser);
        res.status(200).json({
            message: "success",
            data: {
                email: existingUser.email,
                roles: existingUser.roles,
                accessToken,
                refreshToken
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal; server error"
        });
    }
};
exports.login = login;
const registerAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email exists" });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await user_model_1.User.create({
            email,
            password: hash,
            roles: [user_model_1.Role.ADMIN]
        });
        res.status(201).json({
            message: "Admin registed",
            data: { email: user.email, roles: user.roles }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.registerAdmin = registerAdmin;
const getMyProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await user_model_1.User.findById(req.user.sub).select("-password");
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    const { email, roles, _id } = user;
    res.status(200).json({ message: "ok", data: { id: _id, email, roles } });
};
exports.getMyProfile = getMyProfile;
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: "Token required" });
        }
        //import jwt from "jsonwebtoken"
        const payload = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
        const user = await user_model_1.User.findById(payload.sub);
        if (!user) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        const accessToken = (0, tokens_1.signAccessToken)(user);
        res.status(200).json({
            accessToken
        });
    }
    catch (err) {
        res.status(403).json({ message: "Invalid or expire token" });
    }
};
exports.refreshToken = refreshToken;
// Get all users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await user_model_1.User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({
            message: "Users fetched successfully",
            data: users
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.getAllUsers = getAllUsers;
// Update user role and approval status (Admin only)
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roles, approved } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID required" });
        }
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (roles)
            user.roles = roles;
        if (approved)
            user.approved = approved;
        await user.save();
        res.status(200).json({
            message: "User updated successfully",
            data: user
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.updateUser = updateUser;
// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID required" });
        }
        const user = await user_model_1.User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User deleted successfully",
            data: user
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};
exports.deleteUser = deleteUser;
