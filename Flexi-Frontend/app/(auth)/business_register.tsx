import {
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,  
  Switch,
  TouchableOpacity,
} from "react-native";
import { View } from "@/components/Themed";
import FormField from "@/components/formfield/FormField";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CustomButton } from "@/components/CustomButton";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import Dropdown from "@/components/dropdown/Dropdown";
import CallAPIBusiness from "@/api/business_api";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Register() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { userId, uniqueId } = useLocalSearchParams();
  const [businessName, setbusinessName] = useState("");
  const [taxType, settaxType] = useState("");
  const [taxId, settaxId] = useState("");
  const [businessType, setbusinessType] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [isVatRegistered, setIsVatRegistered] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<("Invoice" | "Receipt" | "Quotation" | "WithholdingTax")[]>(["Receipt"]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getBusinessRegisterErrorMessage = (apiError: any) => {
    const reason = apiError?.reason;
    const field = apiError?.details?.field;
    const pathField = apiError?.details?.path;
    const detailType = apiError?.details?.type;
    const detailMessage = apiError?.details?.message;
    const backendMessage = apiError?.message;

    const translateOrNull = (key: string) => {
      const translated = t(key);
      return translated !== key ? translated : null;
    };

    const inferValidationField = () => {
      if (typeof field === "string" && field.length > 0) return field;
      if (typeof pathField === "string" && pathField.length > 0) return pathField;

      const typeText = typeof detailType === "string" ? detailType : "";
      const combinedMessage = `${detailMessage ?? ""} ${backendMessage ?? ""}`.toLowerCase();

      if (combinedMessage.includes("businessname")) return "businessName";
      if (combinedMessage.includes("taxid") || combinedMessage.includes("tax id")) return "taxId";
      if (combinedMessage.includes("businessphone") || combinedMessage.includes("phone")) return "businessPhone";
      if (combinedMessage.includes("businesstype")) return "businessType";
      if (combinedMessage.includes("taxtype")) return "taxType";
      if (combinedMessage.includes("memberid")) return "memberId";
      if (combinedMessage.includes("userid")) return "userId";
      if (combinedMessage.includes("documenttype") || typeText.includes("array")) return "DocumentType";

      return null;
    };

    if (reason === "VALIDATION_ERROR") {
      const normalizedField = inferValidationField();
      if (normalizedField) {
        const fieldKey = `auth.businessRegister.backendErrors.validation.${normalizedField}`;
        const translatedFieldMessage = translateOrNull(fieldKey);
        if (translatedFieldMessage) {
          return translatedFieldMessage;
        }
      }
      return t("auth.businessRegister.backendErrors.validation.default");
    }

    if (reason === "BUSINESS_EXISTS" || reason === "UNIQUE_CONSTRAINT") {
      return t("auth.businessRegister.backendErrors.businessExists");
    }

    if (reason === "INVALID_DOCUMENT_TYPE") {
      return t("auth.businessRegister.backendErrors.invalidDocumentType");
    }

    if (typeof reason === "string" && reason.length > 0) {
      const reasonMessage = translateOrNull(`auth.businessRegister.backendErrors.${reason}`);
      if (reasonMessage) {
        return reasonMessage;
      }
    }

    return t("auth.businessRegister.backendErrors.default");
  };

  // Add alert config state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  // Handle register
  const handleRegister = async () => {
    setError("");

    // Check if all fields are filled
    if (!businessName || !taxType || !taxId || !businessType || !businessPhone) {
      setAlertConfig({
        visible: true,
        title: t("auth.businessRegister.validation.incomplete"),
        message: t("auth.businessRegister.validation.invalidData"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Call the register API
      const data = await CallAPIBusiness.RegisterAPI({
        businessName,
        taxId,
        businessPhone,
        businessType,
        taxType,
        vat: isVatRegistered,
        userId: Number(userId),
        memberId: uniqueId,
        DocumentType: documentTypes,
      });

      if (data.error) throw new Error(data.error);

      setAlertConfig({
        visible: true,
        title: t("auth.businessRegister.alerts.success", "Business Registered"),
        message: t(
          "auth.businessRegister.alerts.successMessage",
          "Your business account was created successfully."
        ),
        buttons: [
          {
            text: t("auth.businessRegister.alerts.continue", "Continue"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              setIsSubmitting(false);
              router.replace("/login");
            },
          },
        ],
      });
      // Navigation now occurs only after user confirms the alert
    } catch (error: any) {
      setError(getBusinessRegisterErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  // Handle document type selection
  const handleDocumentTypeToggle = (type: "Invoice" | "Receipt" | "Quotation" | "WithholdingTax") => {
    // Don't allow unchecking Receipt as it's required
    if (type === "Receipt") return;
    
    setDocumentTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

 const scrollViewRef = useRef<ScrollView>(null);
  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="h-full"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
         ref={scrollViewRef}
          keyboardShouldPersistTaps="handled">
          <View
            className="w-full flex justify-center h-full px-4"
            style={{
              minHeight: Dimensions.get("window").height,
              alignItems: Platform.OS === "web" ? "center" : "center",
            }}
          >
            <View
              style={{
                width: Dimensions.get("window").width > 768 ? "40%" : "100%",
                maxWidth: 600,
              }}
            >
                <CustomText className={`text-2xl font-bold mt-4 justify-center ${useTextColorClass()}`}>
                {t("auth.businessRegister.title")}
                </CustomText>

              <FormField
                title={t("auth.businessRegister.businessName")}
                placeholder={t("auth.businessRegister.businessName")}
                value={businessName}
                handleChangeText={setbusinessName}
                otherStyles="mt-7"
              />

               <FormField
                title={t("auth.businessRegister.businessPhone")}
                placeholder={t("auth.businessRegister.businessPhone")}
                value={businessPhone}
                  handleChangeText={(text) => {
                    const filtered = text.replace(/[^0-9]/g, "").slice(0, 10);
                    setBusinessPhone(filtered);
                  }}
                otherStyles="mt-7"
                keyboardType="phone-pad"
                                            />

              <Dropdown
                title={t("auth.businessRegister.taxType")}
                options={[
                  {
                    label: t("auth.businessRegister.taxTypeOption.Individual"),
                    value: "Individual",
                  },
                  {
                    label: t("auth.businessRegister.taxTypeOption.Juristic"),
                    value: "Juristic",
                  },
                ]}
                placeholder={t("auth.businessRegister.taxType")}
                onValueChange={settaxType}
                selectedValue={t(
                  `auth.businessRegister.taxTypeOption.${taxType}`
                )}
                otherStyles="mt-7"
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                
              />

             

              {/* VAT Toggle */}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 28, marginBottom: 8 }}>
                <CustomText style={{ marginRight: 12 }}>
                  {isVatRegistered
                    ? t("auth.businessRegister.vatRegistered")
                    : t("auth.businessRegister.noVatRegistered")}
                </CustomText>
                <Switch
                  value={isVatRegistered}
                  onValueChange={setIsVatRegistered}
                  trackColor={{ false: theme === "dark" ? "#606060" : "#b1b1b1", true: "#04ecc1" }}
                  thumbColor={isVatRegistered ? "#009688" : theme === "dark" ? "#222" : "#fff"}
                />
              </View>

              <FormField
                title={t("auth.businessRegister.taxId")}
                placeholder={t("0000000000000")}
                value={taxId}
                handleChangeText={(text) => {
                  const filtered = text.replace(/[^0-9]/g, "").slice(0, 13);
                  settaxId(filtered);
                }}
                otherStyles="mt-7"
                keyboardType="number-pad"
                onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
                }}
                />

              <Dropdown
                title={t("auth.businessRegister.businessType")}
                options={[
                  {
                    label: t(
                      "auth.businessRegister.businessTypeOption.OnlineSale"
                    ),
                    value: "OnlineSale",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Massage"),
                    value: "Massage",
                  },
                  {
                    label: t(
                      "auth.businessRegister.businessTypeOption.Restaurant"
                    ),
                    value: "Restaurant",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Bar"),
                    value: "Bar",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Cafe"),
                    value: "Cafe",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Rental"),
                    value: "Rental",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Tutor"),
                    value: "Tutor",
                  },
                  {
                    label: t(
                      "auth.businessRegister.businessTypeOption.Influencer"
                    ),
                    value: "Influencer",
                  },
                  {
                    label: t("auth.businessRegister.businessTypeOption.Other"),
                    value: "Other",
                  },
                ]}
                placeholder={t(
                  "auth.businessRegister.chooseBusinessType"
                )}
                selectedValue={t(
                  `auth.businessRegister.businessTypeOption.${businessType}`
                )}
                onValueChange={setbusinessType}
                otherStyles="mt-7"
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                />

              {/* Document Types Selection */}
              <View style={{ marginTop: 28 }}>
                <CustomText className={`text-base font-medium mb-3 ${useTextColorClass()}`}>
                  {t("auth.businessRegister.documentTypes")}
                </CustomText>
                
                {(["Quotation","Invoice","WithholdingTax","Receipt" ] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: theme === "dark" ? "#2D2D2D" : "#f5f5f5",
                    }}
                    onPress={() => handleDocumentTypeToggle(type)}
                    disabled={type === "Receipt"}
                    activeOpacity={0.8}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: documentTypes.includes(type) 
                          ? "#04ecc1" 
                          : theme === "dark" ? "#666" : "#ccc",
                        backgroundColor: documentTypes.includes(type) 
                          ? "#04ecc1" 
                          : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      {documentTypes.includes(type) && (
                        <Ionicons 
                          name="checkmark" 
                          size={16} 
                          color="#fff" 
                        />
                      )}
                    </View>
                    <CustomText className={useTextColorClass()}>
                      {t(`auth.businessRegister.documentType.${type}`)}
                    </CustomText>
                  </TouchableOpacity>
                ))}
              </View>

              {error ? (
                <CustomText className="mt-4 items-center justify-center text-center "
                style={{color: "#ff2d31"}}>{error}
              </CustomText>
              ) : null}

              <CustomButton
                isLoading={isSubmitting}
                title={t("auth.register.button")}
                handlePress={handleRegister}
                containerStyles="mt-7"
                textStyles="!text-white"
              />
            </View>
          </View>
        </ScrollView> 
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
