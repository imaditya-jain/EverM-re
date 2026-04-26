import { Types } from "mongoose"
import User from "../models/user.model"

type TokenPair = {
    accessToken: string;
    refreshToken: string;
}

const generateAccessAndRefreshToken = async (_id: Types.ObjectId): Promise<TokenPair> => {
    const user = await User.findById(_id).select("-password")

    if (!user) {
        throw new Error("User does not exist.")
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save()

    return { accessToken, refreshToken }
}

export default generateAccessAndRefreshToken
