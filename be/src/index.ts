// import dotenv from "dotenv"
// dotenv.config()

// import express from "express"
// import cors from "cors"
// import mongoose from "mongoose"
// import authRouter from "./routes/auth"
// import adminRouter from "./routes/admin"
// import reviewsRouter from "./routes/reviews"
// // import postRouter from "./routes/post"
// import generateRouter from "./routes/ai"
// import eventsRouter from "./routes/events"
// import bookingsRouter from "./routes/bookings"
// import { authenticate } from "./middleware/auth"
// import { requireRole } from "./middleware/role"
// import { Role } from "./models/user.model"
// import { User, Role as UserRole } from "./models/user.model"
// import bcrypt from "bcryptjs"
// // import connectCloudinary from "./config/clodinaryconfig"

// const PORT = process.env.PORT
// const MONGO_URI = process.env.MONGO_URI as string

// const app = express()

// app.use(express.json())

// // CORS configuration to allow frontend dev servers and handle preflight
// const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174,http://https://event-management-fe-sand.vercel.app/").split(",")
// const corsOptions: cors.CorsOptions = {
//   origin: (origin, callback) => {
//     // Allow requests with no origin (like mobile apps or curl)
//     if (!origin) return callback(null, true)
//     const isAllowed = allowedOrigins.includes(origin)
//     callback(isAllowed ? null : new Error("Not allowed by CORS"), isAllowed)
//   },
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }

// app.use(cors(corsOptions))

// app.use("/api/v1/auth", authRouter)
// app.use("/api/v1/admin", adminRouter)
// app.use("/api/v1/reviews", reviewsRouter)
// app.use("/api/v1/ai", generateRouter)
// app.use("/api/v1/events", eventsRouter)
// app.use("/api/v1/bookings", bookingsRouter)

// //sample route without auth
// app.get("/",(req,resl) => {
//   resl.send("BE running")
// })


// // sample route with auth

// // public
// app.get("/test-1", (req, res) => {})

// // protected
// app.get("/test-2", authenticate, (req, res) => {})

// // admin only
// app.get("/test-3", authenticate, requireRole([Role.ADMIN]), (req, res) => {})

// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log("DB connected")
//     // Optional: Seed initial admin user if ADMIN_EMAIL and ADMIN_PASSWORD are provided
//     const ADMIN_EMAIL = process.env.ADMIN_EMAIL
//     const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
//     if (ADMIN_EMAIL && ADMIN_PASSWORD) {
//       (async () => {
//         try {
//           const existing = await User.findOne({ email: ADMIN_EMAIL })
//           if (!existing) {
//             const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
//             await User.create({
//               email: ADMIN_EMAIL,
//               password: hash,
//               firstname: "Admin",
//               lastname: "User",
//               roles: [UserRole.ADMIN]
//             })
//             console.log("Seeded admin:", ADMIN_EMAIL)
//           } else {
//             console.log("Admin already exists:", existing.email)
//           }
//         } catch (e) {
//           console.error("Admin seed failed:", e)
//         }
//       })()
//     }
//   })
//   .catch((err) => {
//     console.error(err)
//     process.exit(1)
//   });
  
// // connectCloudinary();

// app.listen(PORT, () => {
//   console.log("Server is running")
// })
// // --------------------------------------
// // // Built in middlewares (Global)
// // app.use(express.json())

// // // Thrid party middlewares (Global)
// // app.use(
// //   cors({
// //     origin: ["http://localhost:3000"],
// //     methods: ["GET", "POST", "PUT", "DELETE"] // optional
// //   })
// // )

// // // Global middleware
// // app.use((req, res, next) => {
// //   console.log("Hello")
// //   if (true) {
// //     next() // go forword
// //   } else {
// //     res.sendStatus(400) // stop
// //   }
// // })

// // app.get("/hello", testMiddleware, (req, res) => {
// //   //
// //   res.send("")
// // })

// // app.get("/", testMiddleware, (req, res) => {
// //   console.log("I'm router")
// //   res.status(200).send("Ok")
// // })

// // app.get("/private", testMiddleware, (req, res) => {
// //   console.log("I'm router")
// //   res.status(200).send("Ok")
// // })

// // app.get("/test", (req, res) => {
// //   res.status(200).send("Test Ok")
// // })

// // app.listen(5000, () => {
// //   console.log("Server is running")
// // })

// // path params
// // http://localhost:5000/1234
// // http://localhost:5000/4321
// // http://localhost:5000/hello
// // app.get("/:id", (req, res) => {
// //   const params = req.params
// //   console.log(params)
// //   console.log(params?.id)

// //   res.status(200).send("Ok")
// // })

// // query params ?id=1234
// // http://localhost:5000/?id=1234
// // http://localhost:5000/?id=4321
// // app.get("/", (req, res) => {
// //   const params = req.query
// //   console.log(params)
// //   console.log(params?.id)

// //   res.status(200).send("Ok")
// // })
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";
import reviewsRouter from "./routes/reviews";
import generateRouter from "./routes/ai";
import eventsRouter from "./routes/events";
import bookingsRouter from "./routes/bookings";

const app = express();

/* =======================
   BODY PARSERS
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   CORS CONFIG (VERCEL SAFE)
======================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://event-management-fe-sand.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* 🔥 REQUIRED FOR PREFLIGHT (OPTIONS) */
app.options("*", cors());

/* =======================
   ROUTES
======================= */
app.get("/", (_req, res) => {
  res.status(200).send("Backend running");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/ai", generateRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/bookings", bookingsRouter);

/* =======================
   DATABASE
======================= */
const MONGO_URI = process.env.MONGO_URI as string;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

/* =======================
   🚫 DO NOT app.listen() ON VERCEL
======================= */
export default app;

