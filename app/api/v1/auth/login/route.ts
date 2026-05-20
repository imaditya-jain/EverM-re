import User from "@/app/models/user.model";
import generateAccessAndRefreshToken from "@/app/utils/generateAccessAndRefreshToken.utils";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import { setAuthCookies } from "@/app/utils/auth-cookie.utils";

connectToDatabase()

export const POST = async(request: NextRequest) =>{
    try {

        if(request.method !== "POST") return NextResponse.json({success: false, error:"Method not allowed."},{status: 405})

        const body = await request.json()

        const {loginId, password} = body

        if(!loginId || !password) return NextResponse.json({success: false, error:"Provide all required field."},{status: 400})

        const user = await User.findOne({$or:[{email: loginId},{userName: loginId}]}).select('-otp -otpExpiry -refreshToken')

        if(!user) return NextResponse.json({success: false, error:"User does not exist."},{status: 404})

        const isPasswordmatched = await user.comparePassword(password)

        if(!isPasswordmatched) return NextResponse.json({success: false, error:"Invalid credentials."},{status: 401})

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id) 

        const response = NextResponse.json({success: true, message:`Welcome Back ...! ${user.firstName} ${user.lastName}`, data:{user}},{status: 200})

        setAuthCookies(response, accessToken, refreshToken)

        return response
        
    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while login: ${error.message}`)
        }else{
            console.log(`An unknown error occurred: ${error}`)
        }

        return NextResponse.json({success: false, error:"Internal server error."},{status: 500})
    }
}