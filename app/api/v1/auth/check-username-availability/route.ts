import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/config/db.config";
import User from "@/app/models/user.model";

connectToDatabase()

export async function GET(request: NextRequest){
    try {
        if(request.method !== 'GET') return NextResponse.json({success: false, error:"Method not allowed"},{status: 405})

        const searchParams = request.nextUrl.searchParams
        const userName = searchParams.get('userName')

        const isUserExist = await User.findOne({userName: userName?.toLowerCase()})

        if(isUserExist) return NextResponse.json({success: false, error:'Username is already taken.'},{status:409})

        return NextResponse.json({success: true},{status: 200})
        
    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while checking username availability, ${error.message}`)
        }else{
            console.log(`An unknown error occurred ${error}`)
        }

        return  NextResponse.json({success: false, error:"Internal Server Error."}, {status: 500})
    }
}