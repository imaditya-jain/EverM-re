import { generateInstallUrl } from "@/app/helpers/shopify/generate-install-url";
import { validateShopDomain } from "@/app/helpers/shopify/validate-shop-domain";
import { verifyAccessToken } from "@/app/utils/auth-token.utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
    try {
        if(request.method !== "POST") return NextResponse.json({success: false, error:'Method not allowed.'}, {status: 405})

        const accessToken = request.cookies.get('accessToken')?.value

        if(!accessToken) return NextResponse.json({success: false, error:'Unauthorized. Access token is missing.'},{status: 401})

        if(!verifyAccessToken(accessToken)) return NextResponse.json({success: false, error:'Unauthorized. Invalid access token.'},{status: 401})

        const body = await request.json()
        const {shop} = body

        if(!shop) return NextResponse.json({success: false, error:'Shop domain is required.'},{status: 400})

        if(!validateShopDomain(shop)) return NextResponse.json({success: false, error:'Invalid shop domain.'},{status: 400})

        const installUrl = generateInstallUrl(shop)

        return NextResponse.json({success: true, data:{installUrl}},{status: 200})
        
    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while connecting shopify store: ${error.message}`)
        }else{
            console.log(`An unknown error occurred: ${error}`)
        }

        return NextResponse.json({success: false, error:"Internal server error."},{status: 500})
    }
}