export const GET_PRODUCTS_QUERY = `
query GetProducts($cursor: String) {
  products(first: 250, after: $cursor) {
    nodes {
      id
      title
      handle
      description
      featuredMedia {
        preview {
          image {
            url
          }
        }
      }
      status
      updatedAt
      seo {
        title
        description
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;
