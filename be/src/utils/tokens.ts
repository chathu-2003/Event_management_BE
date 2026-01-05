import { IUSER } from "../models/user.model"
import jwt from "jsonwebtoken"

export const signAccessToken = (user: IUSER): string => {
  const JWT_SECRET = process.env.JWT_SECRET
  
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not defined in environment variables")
  }
  
  return jwt.sign({ sub: user._id.toString(), roles: user.roles }, JWT_SECRET, {
    expiresIn: "30m"
  })
}

export const signRefreshToken = (user: IUSER): string => {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
  
  if (!JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET not defined in environment variables")
  }
  
  return jwt.sign({
    sub:user._id.toString()
  },
JWT_REFRESH_SECRET,{
  expiresIn: "7d"
})
}