import { ai } from "@/app/lib/ai";

interface inputDataType {
    title: string;
    seoTitle: string;
    seoDescription: string;
    handle: string;
}

export const generateSeoAudit = async ({ title, seoTitle, seoDescription, handle }: inputDataType): Promise<{
    status: 'FAILED' | 'COMPLETED'
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
        // if (!title || !seoTitle || !seoDescription || !handle) {
        //     throw new Error('Provide all required fields.')
        // }

        const completion = await ai.chat.completions.create({
            model: 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `
                    Evaluate this product's SEO quality and return a structured audit report.

                    Return ONLY valid JSON.

                    Required JSON format:

                    {
                        "scores": {
                            "title": 65,
                            "description": 98,
                            "handle": 89
                        },
                        "issues": [
                            {
                                "field": "seoTitle",
                                "issue": "Title too short",
                                "severity": "medium"
                            }
                        ],
                        "recommendations": [
                            {
                                "field": "title",
                                "suggestion": "Add primary keyword to title",
                                "impact": "Improved search ranking"
                            }
                        ],
                        "strengths": ["Good keyword usage"],
                        "priority": "High"
                    }

                    Analyze:
                        - keyword optimization
                        - readability
                        - title length (ideal: 50-60 characters)
                        - meta description length (ideal: 150-160 characters)
                        - SEO friendliness
                        - slug quality (should be clean, lowercase, hyphenated)

                    Score from 0-100 where:
                        100 = excellent
                        70-89 = good
                        50-69 = average
                        0-49 = poor

                    Priority Can Be Calculated
                        0-49 => High
                        50-69 => Medium
                        70+ => Low
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
        
        if (!rawResponse) {
            throw new Error('No response from AI');
        }

        const parsedResponse = JSON.parse(rawResponse);
        
        if (!parsedResponse.scores.overall) {
            parsedResponse.scores.overall = Math.round(
                (parsedResponse?.scores?.title + 
                 parsedResponse?.scores?.description + 
                 parsedResponse?.scores?.handle) / 3
            );
        }

        return {
            status: "COMPLETED",
            scores: {
                overall: parsedResponse?.scores?.overall,
                title: parsedResponse?.scores?.title,
                description: parsedResponse?.scores?.description,
                handle: parsedResponse?.scores?.handle
            },
            issues: parsedResponse?.issues || [],
            recommendations: parsedResponse?.recommendations || [],
            strengths: parsedResponse?.strengths || [],
            priority: parsedResponse?.priority || 'Medium'
        };

    } catch (error) {
        console.error('SEO Audit Generation Error:', error);
        
        return {
            status: "FAILED",
            scores: {
                overall: 0,
                title: 0,
                description: 0,
                handle: 0
            },
            issues: [{
                field: 'system',
                issue: 'Failed to generate audit report',
                severity: 'high'
            }],
            recommendations: [{
                field: 'system',
                suggestion: 'Please try again or check your AI service configuration',
                impact: 'Unable to provide SEO recommendations'
            }],
            strengths: [],
            priority: 'High'
        };
    }
}