export const generateInstallUrl = (shop: string) => {
    const apiKey = process.env.SHOPIFY_API_KEY!
    const scopes = process.env.SHOPIFY_SCOPES!
    const redirectURI = process.env.SHOPIFY_REDIRECT_URI!

    return `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectURI}`

}