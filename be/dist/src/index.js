"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const reviews_1 = __importDefault(require("./routes/reviews"));
// import postRouter from "./routes/post"
const ai_1 = __importDefault(require("./routes/ai"));
const events_1 = __importDefault(require("./routes/events"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const auth_2 = require("./middleware/auth");
const role_1 = require("./middleware/role");
const user_model_1 = require("./models/user.model");
const user_model_2 = require("./models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// import connectCloudinary from "./config/clodinaryconfig"
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const app = (0, express_1.default)();
app.use(express_1.default.json());
// CORS configuration to allow frontend dev servers and handle preflight
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174,http://smart-blog-frontend-two.vercel.app").split(",");
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin);
        callback(isAllowed ? null : new Error("Not allowed by CORS"), isAllowed);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/admin", admin_1.default);
app.use("/api/v1/reviews", reviews_1.default);
app.use("/api/v1/ai", ai_1.default);
app.use("/api/v1/events", events_1.default);
app.use("/api/v1/bookings", bookings_1.default);
//sample route without auth
app.get("/", (req, resl) => {
    resl.send("BE running");
});
// sample route with auth
// public
app.get("/test-1", (req, res) => { });
// protected
app.get("/test-2", auth_2.authenticate, (req, res) => { });
// admin only
app.get("/test-3", auth_2.authenticate, (0, role_1.requireRole)([user_model_1.Role.ADMIN]), (req, res) => { });
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log("DB connected");
    // Optional: Seed initial admin user if ADMIN_EMAIL and ADMIN_PASSWORD are provided
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
        (async () => {
            try {
                const existing = await user_model_2.User.findOne({ email: ADMIN_EMAIL });
                if (!existing) {
                    const hash = await bcryptjs_1.default.hash(ADMIN_PASSWORD, 10);
                    await user_model_2.User.create({
                        email: ADMIN_EMAIL,
                        password: hash,
                        firstname: "Admin",
                        lastname: "User",
                        roles: [user_model_2.Role.ADMIN]
                    });
                    console.log("Seeded admin:", ADMIN_EMAIL);
                }
                else {
                    console.log("Admin already exists:", existing.email);
                }
            }
            catch (e) {
                console.error("Admin seed failed:", e);
            }
        })();
    }
})
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
// connectCloudinary();
app.listen(PORT, () => {
    console.log("Server is running");
});
// --------------------------------------
// // Built in middlewares (Global)
// app.use(express.json())
// // Thrid party middlewares (Global)
// app.use(
//   cors({
//     origin: ["http://localhost:3000"],
//     methods: ["GET", "POST", "PUT", "DELETE"] // optional
//   })
// )
// // Global middleware
// app.use((req, res, next) => {
//   console.log("Hello")
//   if (true) {
//     next() // go forword
//   } else {
//     res.sendStatus(400) // stop
//   }
// })
// app.get("/hello", testMiddleware, (req, res) => {
//   //
//   res.send("")
// })
// app.get("/", testMiddleware, (req, res) => {
//   console.log("I'm router")
//   res.status(200).send("Ok")
// })
// app.get("/private", testMiddleware, (req, res) => {
//   console.log("I'm router")
//   res.status(200).send("Ok")
// })
// app.get("/test", (req, res) => {
//   res.status(200).send("Test Ok")
// })
// app.listen(5000, () => {
//   console.log("Server is running")
// })
// path params
// http://localhost:5000/1234
// http://localhost:5000/4321
// http://localhost:5000/hello
// app.get("/:id", (req, res) => {
//   const params = req.params
//   console.log(params)
//   console.log(params?.id)
//   res.status(200).send("Ok")
// })
// query params ?id=1234
// http://localhost:5000/?id=1234
// http://localhost:5000/?id=4321
// app.get("/", (req, res) => {
//   const params = req.query
//   console.log(params)
//   console.log(params?.id)
//   res.status(200).send("Ok")
// })
