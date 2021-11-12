import { Request, Response, NextFunction } from "express"
import HttpException from "./exceptions/HttpException"

const notFoundMiddleware = (err:HttpException, req:Request, res:Response, next:NextFunction) => {
  if (err.status === 404) {
    res.status(404).send({ successful: false, message: err.message })
  } else {
    next(err)
  }
}

const badRequestMiddleware = (err:HttpException, req:Request, res:Response, next:NextFunction) => {
  if (err.status === 400) {
    res.status(400).send(err)
  } else {
    next(err)
  }
}

const unAuthorizedHandler = (err:HttpException, req:Request, res:Response, next:NextFunction) => {
  if (err.status === 401) {
    res.status(401).send(err.message || "You are not logged in!")
  } else {
    next(err)
  }
}

const forbiddenHandler = (err:HttpException, req:Request, res:Response, next:NextFunction) => {
  if (err.status === 403) {
    res.status(403).send(err.message || "You are not allowed to do that!")
  } else {
    next(err)
  }
}

const catchErrorMiddleware = (err:HttpException, req:Request, res:Response, next:NextFunction) => {
  res.status(500).send("Generic Server Error")
}

export { notFoundMiddleware, 
  badRequestMiddleware, 
  unAuthorizedHandler, 
  forbiddenHandler,
  catchErrorMiddleware}