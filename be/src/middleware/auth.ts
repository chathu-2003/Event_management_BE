import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export interface AUthRequest extends Request {
  user?: any
}

export const authenticate = (
  req: AUthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" })
  }
  // Bearer dgcfhvgjygukhiluytkuy
  const token = authHeader.split(" ")[1] // ["Bearer", "dgcfhvgjygukhiluytkuy"]

  const JWT_SECRET = process.env.JWT_SECRET
  
  if (!JWT_SECRET) {
    console.error("JWT_SECRET not defined in environment variables")
    return res.status(500).json({
      message: "Server configuration error"
    })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    console.error("Token verification error:", err)
    res.status(401).json({
      message: "Invalid or expire token"
    })
  }
}
// res, next - return
