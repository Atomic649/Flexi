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

export type ParsedCustomerInfo = {
  name?: string;
  lastName?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  province?: string;
  postal?: string;
  taxType?: "Individual" | "Juristic";
  gender?: "Male" | "Female" | "NotSpecified";
};

type AutoFillBillProps = {
  onApply: (data: ParsedCustomerInfo) => void;
  taxType: "Individual" | "Juristic";
  containerStyle?: StyleProp<ViewStyle>;
};

const THAI_PROVINCES = [
  "กรุงเทพมหานคร",
  "กระบี่",
  "กาญจนบุรี",
  "กาฬสินธุ์",
  "กำแพงเพชร",
  "ขอนแก่น",
  "จันทบุรี",
  "ฉะเชิงเทรา",
  "ชลบุรี",
  "ชัยนาท",
  "ชัยภูมิ",
  "ชุมพร",
  "เชียงราย",
  "เชียงใหม่",
  "ตรัง",
  "ตราด",
  "ตาก",
  "นครนายก",
  "นครปฐม",
  "นครพนม",
  "นครราชสีมา",
  "นครศรีธรรมราช",
  "นครสวรรค์",
  "นนทบุรี",
  "นราธิวาส",
  "น่าน",
  "บึงกาฬ",
  "บุรีรัมย์",
  "ปทุมธานี",
  "ประจวบคีรีขันธ์",
  "ปราจีนบุรี",
  "ปัตตานี",
  "พระนครศรีอยุธยา",
  "พะเยา",
  "พังงา",
  "พัทลุง",
  "พิจิตร",
  "พิษณุโลก",
  "เพชรบุรี",
  "เพชรบูรณ์",
  "แพร่",
  "ภูเก็ต",
  "มหาสารคาม",
  "มุกดาหาร",
  "แม่ฮ่องสอน",
  "ยโสธร",
  "ยะลา",
  "ร้อยเอ็ด",
  "ระนอง",
  "ระยอง",
  "ราชบุรี",
  "ลพบุรี",
  "ลำปาง",
  "ลำพูน",
  "เลย",
  "ศรีสะเกษ",
  "สกลนคร",
  "สงขลา",
  "สตูล",
  "สมุทรปราการ",
  "สมุทรสงคราม",
  "สมุทรสาคร",
  "สระแก้ว",
  "สระบุรี",
  "สิงห์บุรี",
  "สุโขทัย",
  "สุพรรณบุรี",
  "สุราษฎร์ธานี",
  "สุรินทร์",
  "หนองคาย",
  "หนองบัวลำภู",
  "อ่างทอง",
  "อำนาจเจริญ",
  "อุดรธานี",
  "อุตรดิตถ์",
  "อุทัยธานี",
  "อุบลราชธานี",
];

const COMPANY_KEYWORDS = [
  "บริษัท",
  "จำกัด",
  "ห้างหุ้นส่วนจำกัด",
  "มหาชน",
  "company",
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

const ADDRESS_HINTS = [
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
];

const tokenLooksLikeAddress = (token: string) => {
  const cleaned = token.replace(/[.,]/g, "");
  if (/\d/.test(cleaned)) {
    return true;
  }
  return ADDRESS_HINTS.some((hint) => cleaned.startsWith(hint));
};

const detectGenderFromText = (text: string): "Male" | "Female" | undefined => {
  if (FEMALE_TITLES.some((title) => text.includes(title))) {
    return "Female";
  }
  if (MALE_TITLES.some((title) => text.includes(title))) {
    return "Male";
  }
  return undefined;
};

const normalizeAutoFillText = (text: string) =>
  text
    .replace(/[\r\n]+/g, " ")
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

const parseAutoFillInput = (input: string): ParsedCustomerInfo | null => {
  const normalized = normalizeAutoFillText(input);
  if (!normalized) return null;

  const normalizedLower = normalized.toLowerCase();
  const hasCompanyKeyword = COMPANY_KEYWORDS.some((keyword) =>
    normalizedLower.includes(keyword.toLowerCase())
  );

  let working = stripInfoLabels(normalized);
  const result: ParsedCustomerInfo = {};

  const postalMatch = working.match(/(\d{5})(?!.*\d{5})/);
  if (postalMatch) {
    result.postal = postalMatch[1];
    working = working.replace(postalMatch[1], " ").replace(/\s+/g, " ").trim();
  }

  const numberCandidates = Array.from(working.matchAll(/\d{10,13}/g)).map(
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

  let provinceMatch: { name: string; index: number } | null = null;
  for (const province of THAI_PROVINCES) {
    const index = working.lastIndexOf(province);
    if (index !== -1 && (!provinceMatch || index > provinceMatch.index)) {
      provinceMatch = { name: province, index };
    }
  }

  if (provinceMatch) {
    result.province = provinceMatch.name;
    working = `${working.slice(0, provinceMatch.index)} ${working.slice(
      provinceMatch.index + provinceMatch.name.length
    )}`
      .replace(/\s+/g, " ")
      .trim();
  }

  const tokens = working.split(" ").filter(Boolean);
  if (!tokens.length) {
    if (hasCompanyKeyword) {
      result.taxType = "Juristic";
    }
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
    } else {
      result.name = tokens[0];
      if (tokens[1]) {
        result.lastName = tokens[1];
      }
    }
  }

  if (!hasCompanyKeyword) {
    const gender = detectGenderFromText(normalized);
    if (gender) {
      result.gender = gender;
    }
  }

  return result;
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

    const effectiveTaxType = parsed.taxType ?? taxType;
    const missingFields: string[] = [];
    if (!parsed.name) missingFields.push(t("bill.customerName"));
    if (!parsed.lastName && effectiveTaxType !== "Juristic")
      missingFields.push(t("bill.customerLastName"));
    if (!parsed.phone) missingFields.push(t("bill.customerPhone"));
    if (!parsed.address) missingFields.push(t("bill.customerAddress"));
    if (!parsed.province) missingFields.push(t("bill.customerProvince"));
    if (!parsed.postal) missingFields.push(t("bill.customerPostal"));

    if (missingFields.length > 0) {
      setError(
        `${t("bill.validation.missingFields")}:\n• ${missingFields.join(
          "\n• "
        )}`
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
                      if (error) {
                        setError(null);
                      }
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
                    numberOfLines={5}
                    maxLength={500}
                    boxheight={isTextInputFocused ? 110 : undefined}
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
