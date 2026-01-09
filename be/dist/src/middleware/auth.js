"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }
    // Bearer dgcfhvgjygukhiluytkuy
    const token = authHeader.split(" ")[1]; // ["Bearer", "dgcfhvgjygukhiluytkuy"]
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        console.error("JWT_SECRET not defined in environment variables");
        return res.status(500).json({
            message: "Server configuration error"
        });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (err) {
        console.error("Token verification error:", err);
        res.status(401).json({
            message: "Invalid or expire token"
        });
    }
};
exports.authenticate = authenticate;
// res, next - return
