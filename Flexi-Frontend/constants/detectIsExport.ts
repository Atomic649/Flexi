import { THAI_PROVINCES_KEYS } from "@/constants/ThaiProvinces";
import enTranslation from "@/i18n/locales/en/translation.json";

const THAI_PROVINCES_EN: string[] = Object.values(
  (enTranslation as any).provinces as Record<string, string>,
);

export function detectIsExport(address: string, province?: string): boolean {
  if (!address.trim() && !province) return false;
  // Bill: any selected Thai province key means it's in Thailand
  if (province) return false;
  // Check Thai-script province names as substrings
  if (THAI_PROVINCES_KEYS.some((p) => address.includes(p))) return false;
  // Check English province names as whole words (case-insensitive)
  if (
    THAI_PROVINCES_EN.some((p) =>
      new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(address),
    )
  )
    return false;
  return true;
}
