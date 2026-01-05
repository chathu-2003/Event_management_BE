import { Router } from "express"
import {
  getMyProfile,
  login,
  refreshToken,
  registerAdmin,
  registerUser,
  getAllUsers,
  updateUser,
  deleteUser
} from "../controllers/auth.controler"
import { authenticate } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { Role } from "../models/user.model"

const router = Router()

// register (only USER) - public
router.post("/register", registerUser)

router.post("/refresh",refreshToken)

// login - public
router.post("/login", login)

// register (ADMIN) - Admin only
router.post(
  "/admin/register",
  authenticate,
  requireRole([Role.ADMIN]),
  registerAdmin
)

// me - Admin or User both
router.get("/me", authenticate, getMyProfile)

// Admin user management routes
router.get("/users/all", authenticate, requireRole([Role.ADMIN]), getAllUsers)
router.patch("/users/:userId", authenticate, requireRole([Role.ADMIN]), updateUser)
router.delete("/users/:userId", authenticate, requireRole([Role.ADMIN]), deleteUser)

// router.get("/test", authenticate, () => {})

export default router
