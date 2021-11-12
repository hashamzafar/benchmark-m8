import { Router, Request, Response, NextFunction } from "express"
import createError from "http-errors"
import { JWTAuthMiddleware } from "../../auth/middlewares"
import UserModel from "./schema"
import AccomodationsModel from "../accomodations/schema"
import { hostOnly } from "./sharedMiddlewares"
import { DbUser, User } from "./schemaInterface"

const usersRouter = Router()

/***************GET ALL USERS*******************/

usersRouter.get("/", JWTAuthMiddleware, hostOnly, async (req, res, next) => {
  try {
    const users = await UserModel.find()
    res.send(users)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/***************GET ONLY YOUR USER DETAILS*******************/

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/***************GET USER DEATILS BY SPECIFIC ID*******************/

usersRouter.get("/:userId", JWTAuthMiddleware, hostOnly, async (req, res, next) => {
  try {
    const userId = req.params.userId
    const user = await UserModel.findById(userId)
    if (user) {
      res.status(200).send(user)
    } else {
      next(createError(`user with id ${userId} not found`))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/***************EDIT ONLY YOUR USER DEATILS*******************/

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const body = req.user as DbUser
    body.name = req.body.name ? req.body.name : body.name
    body.surname = req.body.surname ? req.body.surname : body.surname
    body.email = req.body.email ? req.body.email : body.email
    body.role = req.body.role ? req.body.role : body.role
    req.user = body
    const editUser = await body.save()
    res.send(editUser)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/***************EDIT USER DEATILS BY ID*******************/

usersRouter.put("/:userId", JWTAuthMiddleware, hostOnly, async (req, res, next) => {
  try {
    const userId = req.params.userId
    const editUser = await UserModel.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    })
    if (editUser) {
      res.send(editUser)
    } else {
      next(createError(404, `user with id: ${userId} not found`))
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/***************DELETE ONLY YOUR USER DEATILS*******************/

usersRouter.delete("/me", JWTAuthMiddleware, async (req:Request, res: Response, next: NextFunction) => {
  try {
    await (req.user as DbUser).deleteOne()
    res.status(204).send()
  } catch (error) {
    console.log(error)
    next(error)
  }
})

/***************DELETE USER DETAILS BY ID*******************/

usersRouter.delete("/:userId", JWTAuthMiddleware, hostOnly, async (req, res, next) => {
  try {
    const userId = req.params.userId
    const user = await UserModel.findByIdAndDelete(userId)
    if (user) {
      res.status(204).send()
    } else {
      next(createError(404, `user with id ${userId} not found`))
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get(
  "/me/accomodation",
  JWTAuthMiddleware,
  hostOnly,
  async (req, res, next) => {
    try {
      const userId = (req.user as DbUser)._id
      const myAccomodations = await AccomodationsModel.find({ host: userId })
      res.send(myAccomodations)
    } catch (error) {
      next(error)
    }
  }
)

export default usersRouter
