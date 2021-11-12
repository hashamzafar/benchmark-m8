import passport from "passport"
import { Strategy as FacebookStrategy } from "passport-facebook"
import UserModel from "../services/users/schema"
import { JWTAuthenticate } from "./tools"
import { Strategy as GoogleStrategy} from "passport-google-oauth20"
import { DbUser } from "../services/users/schemaInterface"

export const facebookStrategy = new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID!, 
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: "https://localhost:4000/auth/facebookRedirect",
    profileFields: ["id", "name", "email"],
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    try {
      const user = await UserModel.findOne({ facebookId: profile.id }) as DbUser
      if (user) {
        const tokens = await JWTAuthenticate(user)
        passportNext(null, { tokens })
      } else {
        const newUser = {
          name: profile?.name?.givenName,
          surname: profile?.name?.familyName,
          facebookId: profile.id,
        }
        const createdUser = new UserModel(newUser)

        const savedUser = await createdUser.save() as DbUser

        const tokens = await JWTAuthenticate(savedUser)

        passportNext(null, { user: savedUser, tokens })
      }
    } catch (error) {
      passportNext(error)
    }
  }
)

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_SECRET!,
    callbackURL: "http://localhost:4000/auth/redirectGoogle",
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    try {
      const user = await UserModel.findOne({ googleId: profile.id }) as DbUser

      if (user) {
        const tokens = await JWTAuthenticate(user) 
        passportNext(null, { tokens })
      } else {
        const newUser = {
          name: profile?.name?.givenName,
          surname: profile?.name?.familyName,
          googleId: profile.id,
        }

        const createdUser = new UserModel(newUser)

        const savedUser = await createdUser.save() as DbUser
        console.log("hi")
        const tokens = await JWTAuthenticate(savedUser)
        passportNext(null, { user: savedUser, tokens })
      }
    } catch (error) {
      console.log(error)
      passportNext(error)
    }
  }
)

passport.serializeUser(function (user, passportNext) {
  passportNext(null, user)
})