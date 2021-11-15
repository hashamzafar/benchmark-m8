import express from "express"
import { Request, Response } from 'express'
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import createError from "http-errors"
import morgan from "morgan"

import usersRouter from "./services/user/index"
import accomodationsRouter from "./services/accommodation/index"
import authRouter from "./services/auth"

import * as errors from "./errorMiddleware"
import cookieParser from "cookie-parser"
import passport from "passport"
import { googleStrategy, facebookStrategy } from "./auth/oauth"


const server = express()

server.use(cookieParser())
passport.use("facebook", facebookStrategy)
passport.use("google", googleStrategy)

// Middlewares
const whitelist = [process.env.FRONTEND_URL, process.env.FRONTEND_PROD_URL]

server.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by cors!"))
      }
    },
    credentials: true,
  })
)
server.use(passport.initialize())
server.use(express.json())
server.use(morgan("dev"))

server.use("/users", usersRouter)
server.use("/accomodation", accomodationsRouter)
server.use("/auth", authRouter)

server.use(errors.badRequestMiddleware)
server.use(errors.catchErrorMiddleware)
server.use(errors.forbiddenHandler)
server.use(errors.notFoundMiddleware)
server.use(errors.unAuthorizedHandler)

console.table(listEndpoints(server))

server.use((req:Request, res:Response) => {
  if (!req.route) {
    const error = createError(404, "This route is not found!")
    res.status(error.status).send(error)
  }
})

export default server