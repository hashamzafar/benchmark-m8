import jwt from "jsonwebtoken"
import UserModel from "../services/users/schema"
import { DbUser, IRole } from "../services/users/schemaInterface"
import { JWTPayload, RefreshData } from "./typings/index"

export const JWTAuthenticate = async (user:DbUser) => {
  const accessToken = await generateJWT({ _id: user._id, role: user.role as IRole})
  const refreshToken = await generateRefreshJWT({ _id: user._id, role: user.role  as IRole })
  user.refreshToken = refreshToken as string
  await user.save()
  return { accessToken, refreshToken }
}

const generateJWT = (payload: JWTPayload) =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" }, (err, token) => {
      if (err) reject(err)
      resolve(token)
    })
  )

const generateRefreshJWT = (payload:JWTPayload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err)
        resolve(token)
      }
    )
  )

export const verifyJWT = (token: string) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET!, (err, decodedToken) => {
      if (err) reject(err)
      resolve(decodedToken)
    })
  )

const verifyRefresh = (token: string) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET!, (err, decodedToken) => {
      if (err) {
        reject(err)
      }
      resolve(decodedToken)
    })
  )

export const refreshTokenFunc = async (actualRefreshToken: string) => {
  try {
    const data = await verifyRefresh(actualRefreshToken) as RefreshData
    console.log("data", data);
    
    const user = await UserModel.findById(data._id)
    if (!user) throw new Error("User is not found")
    if (actualRefreshToken === user.refreshToken) {
      const { accessToken, refreshToken } = await JWTAuthenticate(user)
      return { accessToken, refreshToken }
    } else {
      throw new Error("Token not valid!")
    }
  } catch (error) {
    throw new Error("Token not valid!")
  }
}