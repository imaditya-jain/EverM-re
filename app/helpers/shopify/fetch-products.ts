import { shopifyGraphQLClient } from "./client";
import { GET_PRODUCTS_QUERY } from "../../graphQL/query";

export interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description?: string;
  featuredMedia?: {
    preview?: {
      image?: {
        url?: string;
      };
    };
  };
  seo?: {
    title?: string;
    description?: string;
  };
  status: string;
  updatedAt: string;
}

interface FetchProductsChunkResponse {
  products: ShopifyProductNode[];
  hasNextPage: boolean;
  nextCursor: string | null;
}

interface ShopifyProductsGraphQLResponse {
  data?: {
    products?: {
      nodes?: ShopifyProductNode[];
      pageInfo?: {
        hasNextPage?: boolean;
        endCursor?: string | null;
      };
    };
  };
}

export const fetchProductsChunk = async ({ shop, accessToken, cursor = null, }: { shop: string; accessToken: string; cursor: string | null }): Promise<FetchProductsChunkResponse> => {
    try {
        const response =
            await shopifyGraphQLClient<ShopifyProductsGraphQLResponse>({shop, accessToken, query: GET_PRODUCTS_QUERY, variables: { cursor, },});

        const products = response?.data?.products;

        return {products: products?.nodes || [], hasNextPage:products?.pageInfo?.hasNextPage || false,nextCursor:products?.pageInfo?.endCursor || null,};

    } catch (error) {
        console.log(error)
        throw new Error("Failed to fetch products");
    }
};
