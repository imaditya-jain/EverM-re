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
    strengths: string[]
}> => {
    try {
        
    } catch (error) {
        
    }
}