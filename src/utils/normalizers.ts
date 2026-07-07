export function normalizePhone11(raw: unknown) {
  return String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);
}

export function normalizeOtp6(raw: unknown) {
  return String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);
}
