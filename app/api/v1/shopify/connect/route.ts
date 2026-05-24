import { generateInstallUrl } from "@/app/helpers/shopify/generate-install-url";
import { validateShopDomain } from "@/app/helpers/shopify/validate-shop-domain";
import { getUserIdFromAccessToken, unauthorizedResponse } from "@/app/utils/auth-request.utils";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {
        if(request.method !== "POST") return NextResponse.json({success: false, error:'Method not allowed.'}, {status: 405})

        const userId = getUserIdFromAccessToken(request)

        if(!userId) return unauthorizedResponse('Unauthorized. Invalid access token.')

        const body = await request.json()
        const {shop} = body

        if(!shop) return NextResponse.json({success: false, error:'Shop domain is required.'},{status: 400})

        if(!validateShopDomain(shop)) return NextResponse.json({success: false, error:'Invalid shop domain.'},{status: 400})

        const stateToken = jwt.sign({_id: userId}, process.env.ACCESS_TOKEN_SECRET!,{expiresIn: '10m'})

        const installUrl = generateInstallUrl(shop, stateToken)

        return NextResponse.json({success: true, data:{installUrl}},{status: 200})
        
    } catch (error) {
        if(error instanceof Error && ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)){
            return unauthorizedResponse('Unauthorized. Invalid access token.')
        }

        if(error instanceof Error){
            console.log(`An error occurred while connecting shopify store: ${error.message}`)
        }else{
            console.log(`An unknown error occurred: ${error}`)
        }

        return NextResponse.json({success: false, error:"Internal server error."},{status: 500})
    }
}
