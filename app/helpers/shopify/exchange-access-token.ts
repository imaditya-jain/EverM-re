export const exchangeAccessToken = async (
    shop: string,
    code: string
) => {

    const response = await fetch(
        `https://${shop}/admin/oauth/access_token`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.SHOPIFY_API_KEY,
                client_secret:
                    process.env.SHOPIFY_API_SECRET,
                code,
            }),
        }
    );

    const data = await response.json();

    console.log("SHOPIFY TOKEN RESPONSE:", data);

    if (!response.ok) {
        throw new Error(
            data.error_description ||
            data.error ||
            "Failed to exchange access token"
        );
    }

    return data;
};