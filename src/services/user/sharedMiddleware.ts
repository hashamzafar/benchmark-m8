import { Request, Response, NextFunction } from "express"
import createError from "http-errors"
import { DbUser } from "./schemaInterface"

export const hostOnly = (req:Request, res: Response, next: NextFunction) => {
    if ((req.user as DbUser).role === "Host") {
      next()
    } else {
      next(createError(403, "Host only!"))
    }
  }