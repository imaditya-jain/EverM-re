export const shopifyGraphQLClient = async ({ shop, accessToken, query, variables }: { shop: string, accessToken: string, query: string, variables?: any }) => {
    try {
        const response = await fetch(`https://${shop}/admin/api/2025-01/graphql.json`, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken, }, body: JSON.stringify({ query, variables, }), });

        if (!response.ok) throw new Error("Shopify GraphQL request failed");

        return response.json();
    } catch (error) {
        console.log(error)
    }
}