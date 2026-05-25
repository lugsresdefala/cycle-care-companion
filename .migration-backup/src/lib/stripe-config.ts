// Stripe product/price mapping for subscription tiers
export const STRIPE_TIERS = {
  basic: {
    product_id: "prod_UBSjDxy12ggcNr",
    price_id: "price_1TD5nyFRyKUci3hFbzlg1Bf9",
    name: "Pessoal",
    price_brl: 19.90,
  },
  professional: {
    product_id: "prod_UBXuhebJkzJkWX",
    price_id: "price_1TDAobFRyKUci3hFRWAewvDh",
    name: "Clínico",
    price_brl: 49.90,
  },
  premium: {
    product_id: "prod_UBXvP745IUaxd3",
    price_id: "price_1TDApBFRyKUci3hFyLZCVYxE",
    name: "Clínico Premium",
    price_brl: 99.90,
  },
} as const;
