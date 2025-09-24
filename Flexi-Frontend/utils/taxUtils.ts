// Reusable tax calculation helpers
export function calculateVatFromGross(gross: number, ratePercent = 7) {
  const g = Number(gross) || 0;
  const r = Number(ratePercent) || 0;
  if (r === 0) return { vat: 0, excl: g };
  const vat = (g * r) / (100 + r);
  const excl = g - vat;
  return { vat, excl };
}

export function formatNumber(value: number, decimals = 2) {
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Given final paid amount (base + VAT - WHT), reverse-calculate the base, VAT and WHT.
// Formula: base = final / (1 + vatRate - whtRate)
export function reverseCalculateFromFinal(
  finalAmount: number,
  vatRatePercent = 7,
  whtRatePercent = 3
) {
  const finalAmt = Number(finalAmount) || 0;
  const vatR = Number(vatRatePercent) / 100;
  const whtR = Number(whtRatePercent) / 100;

  const denom = 1 + vatR - whtR;
  const base = denom !== 0 ? finalAmt / denom : 0;
  const vat = base * vatR;
  const wht = base * whtR;

  const reconstructed = base + vat - wht;

  return {
    base,
    vat,
    wht,
    reconstructed,
    // small helper to validate equality within a small epsilon
    isValid: Math.abs(reconstructed - finalAmt) < 0.01,
  };
}
