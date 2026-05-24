type ShopifyGraphQLVariables = Record<string, unknown>;

interface ShopifyGraphQLClientParams {
    shop: string;
    accessToken: string;
    query: string;
    variables?: ShopifyGraphQLVariables;
}

export const shopifyGraphQLClient = async <TResponse = unknown>({ shop, accessToken, query, variables }: ShopifyGraphQLClientParams): Promise<TResponse | undefined> => {
    try {
        const response = await fetch(`https://${shop}/admin/api/2025-01/graphql.json`, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": accessToken, }, body: JSON.stringify({ query, variables, }), });

        if (!response.ok) throw new Error("Shopify GraphQL request failed");

        return response.json() as Promise<TResponse>;
    } catch (error) {
        console.log(error)
    }
}
