import { Router, Request, Response, NextFunction } from "express"
import createError from "http-errors"
import { JWTAuthMiddleware } from "../../auth/middlewares"
import { hostOnly } from "../user/sharedMiddleware"
import AccomodationModel from "./schema"
import { DbAccomodation } from "./schemaInterface"

const accomodationsRouter = Router()

accomodationsRouter.get("/", JWTAuthMiddleware, async (req:Request, res:Response, next :NextFunction) => {
  try {
    const accomodations = await AccomodationModel.find().populate("host")
    res.send(accomodations)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

accomodationsRouter.get("/:id", JWTAuthMiddleware, async (req:Request, res:Response, next :NextFunction) => {
  try {
    const accomodation = await AccomodationModel.findById(req.params.id).populate("host")

    if (accomodation) {
      res.send(accomodation)
    } else {
      next(createError(404, `Accomodation with id ${req.params.id}, is not found!`))
    }
  } catch (error) {
    next(error)
  }
})

accomodationsRouter.post("/", JWTAuthMiddleware, hostOnly, async (req:Request, res:Response, next :NextFunction) => {
  try {
    const newAccomodation = new AccomodationModel({ ...req.body, host: (req.user as DbAccomodation).id })
    const { _id } = await newAccomodation.save()
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

accomodationsRouter.put("/:id", JWTAuthMiddleware, hostOnly, async (req:Request, res:Response, next :NextFunction) => {
  try {
    const updatedAccomodation = await AccomodationModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
    if (updatedAccomodation) {
      res.sendStatus(204)
    } else {
      next(createError(404, `Accomodation with id ${req.params.id} is not found!`))
    }
  } catch (error) {
    next(error)
  }
})

accomodationsRouter.delete(
  "/:id",
  JWTAuthMiddleware,
  hostOnly,
  async (req:Request, res:Response, next :NextFunction) => {
    try {
      const accomodationDeleted = await AccomodationModel.findByIdAndDelete(req.params.id)
      if (accomodationDeleted) {
        res.sendStatus(204)
      } else {
        next(createError(404, `Accomodation with _id ${req.params.id} not found!`))
      }
    } catch (error) {
      next(error)
    }
  }
)

export default accomodationsRouter