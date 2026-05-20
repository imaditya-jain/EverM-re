export const validateShopDomain = (shop: string) => {
const regex =/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
  return regex.test(shop);
};