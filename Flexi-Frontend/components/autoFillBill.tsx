import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "@/components/CustomText";
import { CustomButton, GrayButton } from "@/components/CustomButton";
import FormFieldClear from "@/components/formfield/FormFieldClear";
import { isMobile } from "@/utils/responsive";
import { THAI_PROVINCES_KEYS } from "@/constants/ThaiProvinces";
import { COMMON_COUNTRY_KEYS } from "@/constants/CommonCountries";
import enTranslation from "@/i18n/locales/en/translation.json";

export type ParsedCustomerInfo = {
  name?: string;
  lastName?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  province?: string;
  postal?: string;
  country?: string;
  taxType?: "Individual" | "Juristic";
  gender?: "Male" | "Female" | "NotSpecified";
};

type AutoFillBillProps = {
  onApply: (data: ParsedCustomerInfo) => void;
  taxType: "Individual" | "Juristic";
  containerStyle?: StyleProp<ViewStyle>;
};

// English province names from translation file
const THAI_PROVINCES_EN: string[] = Object.values(
  (enTranslation as any).provinces as Record<string, string>
);

// Map English province name → Thai key
const EN_TO_THAI_PROVINCE: Record<string, string> = Object.fromEntries(
  Object.entries((enTranslation as any).provinces as Record<string, string>).map(
    ([thaiKey, enName]) => [enName.toLowerCase(), thaiKey]
  )
);

// English country name → canonical English name (lowercase → canonical)
const EN_TO_COUNTRY: Record<string, string> = Object.fromEntries(
  COMMON_COUNTRY_KEYS.map((key) => [key.toLowerCase(), key])
);

const COMPANY_KEYWORDS = [
  "บริษัท",
  "จำกัด",
  "ห้างหุ้นส่วนจำกัด",
  "มหาชน",
  "company",
  "co.",
  "ltd",
  "limited",
  "llc",
  "l.l.c",
  "l.l.c.",
  "corp",
  "corporation",
  "inc",
  "inc.",
  "pte",
  "plc",
  "gmbh",
  "s.a.",
];

const FEMALE_TITLES = ["นางสาว", "นาง", "น.ส."];
const MALE_TITLES = ["นาย"];

const INFO_LABELS = [
  "เลขผู้เสียภาษี",
  "เลขประจำตัวผู้เสียภาษี",
  "ที่อยู่",
  "ที่อยู",
  "โทรศัพท์",
  "โทร",
  "เบอร์",
  "phone",
  "tel",
  "tax id",
  "taxid",
  "vat",
  "th vat",
  "tax no",
  "tax number",
  "address",
  "โทรศัพท์มือถือ",
  "เลขประจำตัวผู้เสียภาษีอากร",
  "หมายเลขประจำตัวผู้เสียภาษี",
  "เบอร์โทรศัพท์",
  "นาง",
  "นางสาว",
  "นาย",
  "คุณ",
];

const escapeRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ADDRESS_HINTS_TH = [
  "หมู่บ้าน",
  "หมู่",
  "หมู่ที่",
  "ม.",
  "เลขที่",
  "บ้านเลขที่",
  "ซอย",
  "ซ.",
  "ตรอก",
  "ถนน",
  "ถ.",
  "ตลาด",
  "แขวง",
  "เขต",
  "ตำบล",
  "ต.",
  "อำเภอ",
  "อ.",
  // Branch/office indicators — mark the boundary between company name and address
  "สํานักงานใหญ่",
  "สำนักงานใหญ่",
  "สาขา",
];

// English address tokens that indicate address content
const ADDRESS_HINTS_EN = [
  "street",
  "st",
  "road",
  "rd",
  "ave",
  "avenue",
  "blvd",
  "boulevard",
  "lane",
  "ln",
  "drive",
  "dr",
  "court",
  "ct",
  "floor",
  "fl",
  "suite",
  "apt",
  "building",
  "bldg",
  "district",
  "city",
  "state",
  "zip",
  "postal",
  "po box",
  "p.o.",
];

const tokenLooksLikeAddress = (token: string) => {
  const cleaned = token.replace(/[.,]/g, "").toLowerCase();
  if (/\d/.test(cleaned)) return true;
  if (ADDRESS_HINTS_TH.some((hint) => cleaned.startsWith(hint))) return true;
  if (ADDRESS_HINTS_EN.some((hint) => cleaned === hint || cleaned.startsWith(hint + " "))) return true;
  return false;
};

const detectGenderFromText = (text: string): "Male" | "Female" | undefined => {
  if (FEMALE_TITLES.some((title) => text.includes(title))) return "Female";
  if (MALE_TITLES.some((title) => text.includes(title))) return "Male";
  return undefined;
};

/**
 * Pre-clean OCR output before parsing:
 * 1. Remove noise lines — lines where most tokens are isolated 1-2 char fragments
 *    (typical OCR garbage like "๕ 7   a ๓  ซ  ll" or "ส   ป    a  4")
 * 2. Strip common OCR label artifacts at the start of lines (e.g. "Neg:", "No.")
 */
const preCleanOCRText = (text: string): string => {
  // Common OCR mis-read prefixes that appear before address/content lines
  const ARTIFACT_PREFIX = /^(?:Neg|No|Net|Ref|Fax|Tel|Mob)\s*[:.]\s*/i;

  return text
    .split(/[\r\n]+/)
    .filter((line) => {
      const stripped = line.trim();
      if (!stripped) return false;
      const tokens = stripped.split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return false;
      // Filter: if ≥60% of tokens are 1-2 characters it is likely noise
      if (tokens.length >= 3) {
        const shortCount = tokens.filter((t) => t.length <= 2).length;
        if (shortCount / tokens.length >= 0.6) return false;
      } else if (tokens.length <= 2 && tokens.every((t) => t.length <= 2)) {
        // Short line with all tiny tokens — noise
        return false;
      }
      return true;
    })
    .map((line) =>
      line
        .replace(ARTIFACT_PREFIX, "")
        // Strip Thai document label prefixes: "บริษัท :", "ชื่อ :", "ที่อยู่ :", "สาขา :"
        .replace(/^(?:บริษัท|ชื่อ|ชื่อบริษัท|ที่อยู่|สาขา)\s*[:.：]\s*/i, "")
        .trim()
    )
    .filter(Boolean)
    .join("\n");
};

const normalizeAutoFillText = (text: string) =>
  text
    .replace(/[\r\n]+/g, " ")
    .replace(/\S+@\S+\.\S+/g, " ") // strip email addresses
    .replace(/[:,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stripInfoLabels = (text: string) => {
  if (!INFO_LABELS.length) return text;
  const pattern = INFO_LABELS.map(escapeRegex).join("|");
  const boundary = "(?:^|\\s|[:：\\-.,])";
  const lookahead = "(?=\\s|[:：\\-.,]|\\d|$)";
  const regex = new RegExp(`${boundary}(?:${pattern})${lookahead}`, "gi");
  return text.replace(regex, " ").replace(/\s+/g, " ").trim();
};

// Try to detect country from text (English country names as whole words)
const detectCountry = (text: string): { name: string; index: number } | null => {
  let best: { name: string; index: number } | null = null;
  // Sort longest-first so "United Arab Emirates" matches before "United"
  const sortedKeys = [...COMMON_COUNTRY_KEYS].sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    const regex = new RegExp(
      `\\b${escapeRegex(key)}\\b`,
      "i"
    );
    const match = text.match(regex);
    if (match && match.index !== undefined) {
      if (!best || match.index > best.index) {
        best = { name: key, index: match.index };
      }
    }
  }
  return best;
};

// Try to detect English province from text
const detectEnglishProvince = (text: string): { thaiKey: string; enName: string; index: number } | null => {
  let best: { thaiKey: string; enName: string; index: number } | null = null;
  // Sort longest-first to prefer specific matches
  const sortedEN = [...THAI_PROVINCES_EN].sort((a, b) => b.length - a.length);
  for (const enName of sortedEN) {
    const regex = new RegExp(`\\b${escapeRegex(enName)}\\b`, "i");
    const match = text.match(regex);
    if (match && match.index !== undefined) {
      const thaiKey = EN_TO_THAI_PROVINCE[enName.toLowerCase()];
      if (thaiKey && (!best || match.index > best.index)) {
        best = { thaiKey, enName, index: match.index };
      }
    }
  }
  return best;
};

export const parseAutoFillInput = (input: string): ParsedCustomerInfo | null => {
  const normalized = normalizeAutoFillText(preCleanOCRText(input));
  if (!normalized) return null;

  const normalizedLower = normalized.toLowerCase();
  const hasCompanyKeyword = COMPANY_KEYWORDS.some((keyword) =>
    normalizedLower.includes(keyword.toLowerCase())
  );

  let working = stripInfoLabels(normalized);
  const result: ParsedCustomerInfo = {};

  // --- Tax ID (13-digit) and phone (9-10 digit starting with 0) ---
  // Must run BEFORE postal extraction — long numbers contain 5-digit substrings
  // that would otherwise be falsely matched as postal codes.
  const numberCandidates = Array.from(working.matchAll(/(?<!\d)\d{9,13}(?!\d)/g)).map(
    (match) => match[0]
  );
  for (const candidate of numberCandidates) {
    if (candidate.length === 13 && !result.taxId) {
      result.taxId = candidate;
      working = working.replace(candidate, " ").replace(/\s+/g, " ").trim();
      continue;
    }
    if (
      (candidate.length === 9 || candidate.length === 10) &&
      candidate.startsWith("0") &&
      !result.phone
    ) {
      result.phone = candidate;
      working = working.replace(candidate, " ").replace(/\s+/g, " ").trim();
    }
  }

  // --- Postal code (standalone 5-digit, not part of a longer number) ---
  const postalMatches = Array.from(working.matchAll(/(?<!\d)(\d{5})(?!\d)/g));
  if (postalMatches.length) {
    const lastPostal = postalMatches[postalMatches.length - 1];
    result.postal = lastPostal[1];
    working = (
      working.slice(0, lastPostal.index!) +
      " " +
      working.slice(lastPostal.index! + lastPostal[1].length)
    )
      .replace(/\s+/g, " ")
      .trim();
  }

  // --- Country (English, checked before province to avoid false province match) ---
  const countryMatch = detectCountry(working);
  if (countryMatch && countryMatch.name !== "Thailand") {
    result.country = countryMatch.name;
    working = (
      working.slice(0, countryMatch.index) +
      " " +
      working.slice(countryMatch.index + countryMatch.name.length)
    )
      .replace(/\s+/g, " ")
      .trim();
  } else if (countryMatch && countryMatch.name === "Thailand") {
    // Strip "Thailand" from text but don't set country (domestic)
    working = (
      working.slice(0, countryMatch.index) +
      " " +
      working.slice(countryMatch.index + countryMatch.name.length)
    )
      .replace(/\s+/g, " ")
      .trim();
  }

  // --- Province: Thai script first, then English ---
  let provinceMatch: { name: string; index: number } | null = null;
  for (const province of THAI_PROVINCES_KEYS) {
    const index = working.lastIndexOf(province);
    if (index !== -1 && (!provinceMatch || index > provinceMatch.index)) {
      provinceMatch = { name: province, index };
    }
  }

  if (provinceMatch) {
    result.province = provinceMatch.name;
    working = (
      working.slice(0, provinceMatch.index) +
      " " +
      working.slice(provinceMatch.index + provinceMatch.name.length)
    )
      .replace(/\s+/g, " ")
      .trim();
  } else {
    // Try English province
    const enProvince = detectEnglishProvince(working);
    if (enProvince) {
      result.province = enProvince.thaiKey;
      working = (
        working.slice(0, enProvince.index) +
        " " +
        working.slice(enProvince.index + enProvince.enName.length)
      )
        .replace(/\s+/g, " ")
        .trim();
    }
  }

  // --- Name + address ---
  const tokens = working.split(" ").filter(Boolean);
  if (!tokens.length) {
    if (hasCompanyKeyword) result.taxType = "Juristic";
    return Object.keys(result).length ? result : null;
  }

  const addressStartIndex = tokens.findIndex((token) =>
    tokenLooksLikeAddress(token)
  );

  const nameTokens =
    addressStartIndex === -1
      ? tokens.slice(0, Math.min(2, tokens.length))
      : tokens.slice(0, addressStartIndex);
  const addressTokens =
    addressStartIndex === -1
      ? tokens.slice(Math.min(2, tokens.length))
      : tokens.slice(addressStartIndex);

  if (addressTokens.length) {
    result.address = addressTokens.join(" ");
  }

  if (hasCompanyKeyword) {
    const companyName = nameTokens.length
      ? nameTokens.join(" ")
      : tokens.join(" ");
    if (companyName) {
      result.name = companyName;
      result.lastName = "";
    }
    result.taxType = "Juristic";
  } else {
    if (nameTokens.length > 0) {
      result.name = nameTokens[0];
      if (nameTokens.length > 1) {
        result.lastName = nameTokens.slice(1).join(" ");
      }
    } else if (addressStartIndex === -1) {
      // No address detected at all — treat first tokens as name
      result.name = tokens[0];
      if (tokens[1]) result.lastName = tokens[1];
    }
    // addressStartIndex === 0 means the whole text is address — no name to extract
  }

  if (!hasCompanyKeyword) {
    const gender = detectGenderFromText(normalized);
    if (gender) result.gender = gender;
  }

  return Object.keys(result).length ? result : null;
};

const AutoFillBill: React.FC<AutoFillBillProps> = ({
  onApply,
  taxType,
  containerStyle,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);

  const handleOpenModal = () => {
    setError(null);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setInputText("");
    setError(null);
  };

  const handleConfirm = () => {
    if (!inputText.trim()) {
      setError(
        t("bill.autoFill.enterText", {
          defaultValue: "กรุณาวางข้อมูลลูกค้าก่อนยืนยัน",
        })
      );
      return;
    }

    const parsed = parseAutoFillInput(inputText);
    if (!parsed) {
      setError(
        t("bill.autoFill.parseError", {
          defaultValue: "ไม่สามารถอ่านข้อมูลได้ กรุณาลองอีกครั้ง",
        })
      );
      return;
    }

    onApply(parsed);
    handleCancel();
  };

  return (
    <>
      <TouchableOpacity
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
          },
          containerStyle,
        ]}
        onPress={handleOpenModal}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.8}
      >
        <CustomText
          weight="bold"
          style={{
            color: "#03dbc1",
            fontSize: 18,
            paddingHorizontal: 5,
          }}
        >
          AUTOFILL
        </CustomText>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <TouchableWithoutFeedback
            onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss}
            accessible={false}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 12,
              }}
            >
              <View
                style={{
                  width: isMobile() ? "100%" : "60%",
                  maxWidth: 620,
                  backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 12 }}
                  showsVerticalScrollIndicator={false}
                >
                  <CustomText
                    weight="bold"
                    style={{
                      fontSize: 18,
                      marginBottom: 10,
                      color: theme === "dark" ? "#e5e5e5" : "#333333",
                    }}
                  >
                    {t("bill.autoFill")}
                  </CustomText>
                  <CustomText
                    style={{
                      fontSize: 14,
                      color: theme === "dark" ? "#9ca3af" : "#4b5563",
                      marginBottom: 12,
                    }}
                  >
                    {t("bill.autoFillInstructions", {
                      defaultValue:
                        "วางข้อมูลลูกค้าในรูปแบบ: ชื่อ นามสกุล เบอร์โทร ที่อยู่ จังหวัด รหัสไปรษณีย์",
                    })}
                  </CustomText>
                  <FormFieldClear
                    title=""
                    value={inputText}
                    handleChangeText={(value: string) => {
                      if (error) setError(null);
                      setInputText(value);
                    }}
                    placeholder=""
                    borderColor={theme === "dark" ? "#606060" : "#b1b1b1"}
                    placeholderTextColor={
                      theme === "dark" ? "#606060" : "#b1b1b1"
                    }
                    textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                    otherStyles="mb-2"
                    multiline={true}
                    numberOfLines={15}
                    maxLength={500}
                    boxheight={isTextInputFocused ? 150 : undefined}
                    onFocus={() => setIsTextInputFocused(true)}
                    onBlur={() => setIsTextInputFocused(false)}
                  />
                  {error && (
                    <CustomText
                      style={{
                        color: "#ef4444",
                        marginBottom: 12,
                        fontSize: 13,
                      }}
                    >
                      {error}
                    </CustomText>
                  )}
                </ScrollView>
                <View style={{ flexDirection: "row", marginTop: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <GrayButton
                      title={t("common.cancel")}
                      handlePress={handleCancel}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <CustomButton
                      title={t("common.confirm")}
                      handlePress={handleConfirm}
                      containerStyles="bg-[#04ecc1]"
                      textStyles={
                        theme === "dark" ? "text-[#18181b]" : "text-[#0f172a]"
                      }
                    />
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default AutoFillBill;
