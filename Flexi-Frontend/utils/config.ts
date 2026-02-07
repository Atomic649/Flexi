const stripTrailingSlash = (url?: string) => (url || "").replace(/\/+$/, "");

export const API_URL = stripTrailingSlash(process.env.EXPO_PUBLIC_API_URL) + "/";
export const IMAGE_URL = stripTrailingSlash(process.env.EXPO_PUBLIC_IMAGE_URL) + "/";
export const MOCKUP_IMAGE_URL =
  stripTrailingSlash(process.env.EXPO_PUBLIC_MOCKUP_IMAGE_URL) + "/";