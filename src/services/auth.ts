import { Router, Request, Response, NextFunction } from "express"
import createError from "http-errors"
import passport from "passport"
import { JWTAuthenticate, refreshTokenFunc } from "../auth/tools"
import { PassportNextUser, PassportUser } from "../auth/typings/index"
import UserModel from "./user/schema"
import { DbUser, User } from "./user/schemaInterface"

const authRouter = Router()

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await UserModel.checkCredentials(email, password)
    if (user) {
      const { accessToken, refreshToken } = await JWTAuthenticate(user)
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
      })
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false })
      res.redirect(`http://localhost:4000/users/me`)
    } else {
      next(createError(401, "Credentials are not valid"))
    }
  } catch (error) {
    next(error)
  }
})

authRouter.post("/register", async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await UserModel.findOne({ email: email })
    if (user) {
      next(createError(403, "Email already exists"))
    } else {
      const newUser = new UserModel(req.body)
      const addedUser = await newUser.save() as DbUser
      const { accessToken, refreshToken } = await JWTAuthenticate(addedUser)
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
      })
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false })
      res.redirect(`http://localhost:4000/users/me`)
    }
  } catch (error) {
    next(error)
  }
})

authRouter.get("/facebookLogin", passport.authenticate("facebook"))

authRouter.get(
  "/facebookRedirect",
  passport.authenticate("facebook"),
  async (req, res, next) => {
    try {
      res.cookie("accessToken", (req.user as PassportNextUser).tokens.accessToken, {
        httpOnly: true,
        secure: false,
      })
      res.cookie("refreshToken", (req.user as PassportNextUser).tokens.refreshToken, {
        httpOnly: true,
        secure: false,
      })
      res.redirect(`http://localhost:4000/users/me`)
    } catch (error) {
      next(error)
    }
  }
)

authRouter.get("/refreshToken", async (req, res, next) => {
  try {
    const refreshTokenOld = req.cookies.refreshToken
    const { accessToken, refreshToken } = await refreshTokenFunc(refreshTokenOld)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
    })
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: false })
    res.redirect(`http://localhost:4000/users/me`)
  } catch (error) {
    next(error)
  }
})

authRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

authRouter.get(
  "/redirectGoogle",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      res.cookie("accessToken", (req.user as PassportNextUser).tokens.accessToken, {
        httpOnly: true,
        secure: false,
      })
      res.cookie("refreshToken", (req.user as PassportNextUser).tokens.refreshToken, {
        httpOnly: true,
        secure: false,
      })
      res.redirect(`http://localhost:4000/users/me`)
    } catch (error) {
      next(error)
    }
  }
)

export default authRouter