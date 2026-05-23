import { ai } from "@/app/lib/ai";
import { verifyAccessToken } from "@/app/utils/auth-token.utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        if (request.method !== "POST") return NextResponse.json({ success: false, error: "Method not allowed." }, { status: 405 })

        const accessToken = request.cookies.get('accessToken')?.value

        if (!accessToken) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 })

        const verifiedToken = verifyAccessToken(accessToken)

        if (!verifiedToken) return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 })

        const body = await request.json()

        const { title, description } = body

        if (!title || !description) return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 })

        const completion = await ai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo',
            messages: [

                {
                    role: "system",

                    content: `
You are a Shopify SEO expert.

Return ONLY valid JSON.

Required JSON format:

{
  "seoTitle": "",
  "metaDescription": "",
  "tags": []
}

Rules:
- SEO title max 60 characters
- Meta description max 160 characters
- Tags should be short
- No markdown
- No explanations
- No extra text
            `,
                },

                {
                    role: "user",

                    content: `
Product Title:
${title}

Product Description:
${description}

Generate optimized Shopify SEO.
            `,
                },
            ],

            response_format: {
                type: "json_object"
            }
        })


        const rawResponse = completion.choices[0]?.message?.content;

        if (!rawResponse) return NextResponse.json({ success: false, error: "No response from AI." }, { status: 500 })

        let parsedResponse;

        try {
            parsedResponse = JSON.parse(rawResponse);
        } catch {
            return NextResponse.json({ success: false, error: "Invalid AI JSON response.", }, { status: 500, });
        }


        return NextResponse.json({ success: true, data: { response: parsedResponse }, message: "SEO Title and Description generated successfully." }, { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.log(`An unknown error occurred while generating seo: ${error.message}`)
        } else {
            console.log(`An unknown error occurred: ${error}`)
        }

        return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 })
    }
}