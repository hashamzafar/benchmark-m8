
import {Model, Document } from "mongoose"

export type IRole = "Host" | "Guest"

export interface User{ 
    name: string
    surname: string
    email?: string
    password?: string
    facebookId?: string
    googleId?: string
    refreshToken?: string
    role?: IRole
}

export interface DbUser extends Document, User {}

export interface UserModel extends Model<DbUser>{
    checkCredentials(email:string, password:string):Promise<DbUser | null>;
  }