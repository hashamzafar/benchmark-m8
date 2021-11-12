import createError from "http-errors"
import UserModel from "../services/users/schema"
import { verifyJWT } from "./tools"
import { Request, Response, NextFunction } from "express"
import { RefreshData } from "./typings/index"

export const JWTAuthMiddleware = async (req:Request, res:Response, next:NextFunction) => {
  console.log(req.cookies);
  if (!req.cookies.accessToken) {
    next(createError(401, "please provide credentials in the authorization header!!"))
  } else {
    try {
      const token = req.cookies.accessToken
      const decodedToken = await verifyJWT(token) as RefreshData
      const user = await UserModel.findById(decodedToken._id)
      if (user) {
        req.user = user
        next()
      } else {
        next(createError(404, "User not found"))
      }
    } catch (error) {
      next(createError(401, "Token has expired!"))
    }
  }
}