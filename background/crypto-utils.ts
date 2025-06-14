import CryptoJS from "crypto-js";

// const SIGNATURE_SECRET = process.env.PLASMO_PUBLIC_EXTENSION_API_SIGNATURE_SECRET;
const SIGNATURE_SECRET = "this_is_a_test_secret";

if (!SIGNATURE_SECRET) {
  throw new Error("Signature secret is not defined in .env file! (PLASMO_PUBLIC_EXTENSION_API_SIGNATURE_SECRET)");
}

export function generateSignature(timestamp: string, payload: string): string {
  const dataToSign = `${timestamp}.${payload}`;
  const hmac = CryptoJS.HmacSHA256(dataToSign, SIGNATURE_SECRET);
  return hmac.toString(CryptoJS.enc.Base64);
} 