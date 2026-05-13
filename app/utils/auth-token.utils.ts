import jwt from "jsonwebtoken";

export const verifyAccessToken = (token: string) =>{
    if(!process.env.ACCESS_TOKEN_SECRET){
        throw new Error("ACCESS_TOKEN_SECRET is missing")
    }

    return jwt.verify(token.toString(), process.env.ACCESS_TOKEN_SECRET)
}

export const verifyRefreshToken = (token: string) =>{
    if(!process.env.REFRESH_TOKEN_SECRET){
        throw new Error("REFRESH_TOKEN_SECRET is missing")
    }

    return jwt.verify(token.toString(), process.env.REFRESH_TOKEN_SECRET)
}