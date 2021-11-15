import { DbUser, IRole } from "../../services/user/schemaInterface";
import { ObjectId } from "mongoose";

export interface JWTPayload{
    _id: ObjectId
    role: IRole
}

export interface RefreshData extends JWTPayload{
    iat: number
}

interface IName{
   givenName: string
   familyName: string
}

export interface Profile{
    name: IName
    surname: string
    id: string
}

export interface ITokens{
    accessToken: string
    refreshToken: string
}

export interface PassportNextUser{
   user?: DbUser
   tokens: ITokens
}

export interface PassportUser{
   user:PassportNextUser
}