import { ai } from "@/app/lib/ai";

interface inputDataType {
    title: string;
    seoTitle: string;
    seoDescription: string;
    handle: string;
}

export const generateSeoAudit = async ({ title, seoTitle, seoDescription, handle }: inputDataType): Promise<{
    scores: {
        overall: number;
        title: number;
        description: number;
        handle: number;
    },
    issues: {
        field: string;
        issue: string;
        severity: 'low' | 'medium' | 'high';
    }[],
    recommendations: {
        field: string;
        suggestion: string;
        impact: string;
    }[],
    strengths: string[],
    priority: 'High' | 'Medium' | 'Low';
}> => {
    try {
        if (!title || !seoTitle || !seoDescription || !handle) {
            throw new Error('Provide all required fields.')
        }

        const completion = await ai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `
                    You are ecommerce SEO audit expert.

                    Return ONLY valid JSON.

                    Required JSON format:

                    {
                        scores:{
                            overall: (title + description + handle) / 3,
                            title: 65%,
                            description: 98%,
                            handle: 89%
                        },
                        issues:[
                            {
                                field: "seoTitle",
                                issue: "Title too short",
                                severity: "medium"
                            }
                        ],
                        recommendations:[
                            {
                                field: "title";
                                suggestion: "";
                                impact: "";
                            }
                        ],
                        strengths:["Good keyword usage"],
                        priority: 'High',
                    
                    }

                    Analyze:
                        - keyword optimization
                        - readability
                        - title length
                        - SEO friendliness
                        - slug quality

                    
                    
                    `
                },
                {
                    role: "user",
                    content: `
                        Product Title:
                        ${title}

                        Product Meta Title:
                        ${seoTitle}

                        Product Meta Description:
                        ${seoDescription}

                        Product Handle:
                        ${handle}

                        Generate SEO Audit Report
                    `
                }
            ],
            response_format: {
                type: 'json_object'
            }
        })

        const rawResponse = completion.choices[0]?.message?.content;


    } catch (error) {

    }
}