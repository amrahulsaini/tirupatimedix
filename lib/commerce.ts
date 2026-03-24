export const GST_PERCENT = 5;

export const UDAIPUR_SPECIAL_PINCODES = new Set([
  "313001",
  "313002",
  "313003",
  "313004",
  "313005",
]);

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 2000;
export const UDAIPUR_FREE_SHIPPING_THRESHOLD = 1000;

export function getShippingFee(subtotal: number, pincode: string) {
  const normalizedPincode = pincode.trim();
  const shippingFlatFee = Number(process.env.SHIPPING_FLAT_FEE ?? 79);
  const isUdaipurPincode = UDAIPUR_SPECIAL_PINCODES.has(normalizedPincode);
  const threshold = isUdaipurPincode
    ? UDAIPUR_FREE_SHIPPING_THRESHOLD
    : DEFAULT_FREE_SHIPPING_THRESHOLD;

  const shippingAmount = subtotal >= threshold ? 0 : shippingFlatFee;

  return {
    normalizedPincode,
    shippingAmount,
    threshold,
    isUdaipurPincode,
    shippingFlatFee,
  };
}

export function getPricingBreakup(subtotal: number, pincode: string) {
  const gstAmount = Number(((subtotal * GST_PERCENT) / 100).toFixed(2));
  const shipping = getShippingFee(subtotal, pincode);
  const total = Number((subtotal + gstAmount + shipping.shippingAmount).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    gstPercent: GST_PERCENT,
    gstAmount,
    shippingAmount: Number(shipping.shippingAmount.toFixed(2)),
    total,
    freeShippingThreshold: shipping.threshold,
    isUdaipurPincode: shipping.isUdaipurPincode,
  };
}
