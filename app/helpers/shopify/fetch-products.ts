import { shopifyGraphQLClient } from "./client";
import { GET_PRODUCTS_QUERY } from "../../graphQL/query";

interface FetchProductsChunkResponse {
  products: any[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

export const fetchProductsChunk = async ({ shop, accessToken, cursor = null, }: { shop: string; accessToken: string; cursor: string | null }): Promise<FetchProductsChunkResponse> => {
    try {
        const response =
            await shopifyGraphQLClient({shop, accessToken, query: GET_PRODUCTS_QUERY, variables: { cursor, },});

        const products = response?.data?.products;

        return {products: products?.nodes || [], hasNextPage:products?.pageInfo?.hasNextPage || false,nextCursor:products?.pageInfo?.endCursor || null,};

    } catch (error) {
        console.log(error)
        throw new Error("Failed to fetch products");
    }
};