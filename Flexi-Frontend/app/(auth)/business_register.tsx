import {
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { View } from "@/components/Themed";
import FormField from "@/components/formfield/FormField";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CustomButton } from "@/components/CustomButton";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import Dropdown from "@/components/dropdown/Dropdown";
import CallAPIBusiness from "@/api/business_api";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "business_register_form_data";

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

  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setbusinessName(parsed.businessName || "");
          settaxType(parsed.taxType || "");
          settaxId(parsed.taxId || "");
          setbusinessType(parsed.businessType || "");
          setBusinessPhone(parsed.businessPhone || "");
          setIsVatRegistered(parsed.isVatRegistered || false);
          setDocumentTypes(parsed.documentTypes || ["Receipt"]);
        }
      } catch (err) {
        console.error("Error loading saved data:", err);
      }
    };
    loadSavedData();
  }, []);

  // Auto-save form data whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToSave = {
          businessName,
          taxType,
          taxId,
          businessType,
          businessPhone,
          isVatRegistered,
          documentTypes,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (err) {
        console.error("Error saving data:", err);
      }
    };
    saveData();
  }, [businessName, taxType, taxId, businessType, businessPhone, isVatRegistered, documentTypes]);

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

      // Clear saved data on successful registration
      await AsyncStorage.removeItem(STORAGE_KEY);

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

  // Show legal warning before enabling VAT
  const handleVatSelect = (value: boolean) => {
    if (!value) { setIsVatRegistered(false); return; }
    setAlertConfig({
      visible: true,
      title: t("auth.businessRegister.vatAlert.title"),
      message:
        t("auth.businessRegister.vatAlert.declaration") + "\n\n" +
        t("auth.businessRegister.vatAlert.legalHeader") + "\n" +
        "• " + t("auth.businessRegister.vatAlert.penalty1") + "\n" +
        "• " + t("auth.businessRegister.vatAlert.penalty2") + "\n\n" +
        t("auth.businessRegister.vatAlert.fraudDisclaimer"),
      buttons: [
        {
          text: t("auth.businessRegister.vatAlert.cancelButton"),
          style: "cancel",
          onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
        },
        {
          text: t("auth.businessRegister.vatAlert.confirmButton"),
          style: "default",
          onPress: () => {
            setIsVatRegistered(true);
            setAlertConfig((prev) => ({ ...prev, visible: false }));
          },
        },
      ],
    });
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
              {/* Step Indicator - Step 2 of 2 */}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 24, justifyContent: "center", paddingHorizontal: 50 }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#04ecc1",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Ionicons name="checkmark" size={18} color="#000" />
                </View>
                <View style={{
                  flex: 1,
                  height: 2,
                  backgroundColor: "#04ecc1",
                  marginHorizontal: 12,
                }} />
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#04ecc1",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <CustomText style={{ color: "#000", fontWeight: "bold", fontSize: 14 }}>2</CustomText>
                </View>
              </View>

                <CustomText className={`text-2xl font-bold justify-center ${useTextColorClass()}`}>
                {t("auth.businessRegister.title")}
                </CustomText>
                <CustomText style={{ fontSize: 13, opacity: 0.7, marginTop: 8, textAlign: "center", lineHeight: 20 }} className={useTextColorClass()}>
                {t("auth.businessRegister.detailedDescription")}
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

             

              {/* VAT Selector */}
              <View style={{ marginTop: 28, marginBottom: 8 }}>
                <CustomText style={{ marginBottom: 8, fontSize: 14, fontWeight: "600", color: theme === "dark" ? "#b1b1b1" : "#606060", alignSelf: "flex-start" }}>
                  {t("auth.businessRegister.vatSectionLabel")}
                </CustomText>
                <View style={{ flexDirection: "row", borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: theme === "dark" ? "#444" : "#d1d1d1" }}>
                  <TouchableOpacity
                    onPress={() => handleVatSelect(false)}
                    style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", backgroundColor: !isVatRegistered ? (theme === "dark" ? "#444" : "#e0e0e0") : "transparent" }}
                  >
                    <CustomText style={{ fontSize: 13, fontWeight: !isVatRegistered ? "600" : "400", color: !isVatRegistered ? (theme === "dark" ? "#fff" : "#333") : (theme === "dark" ? "#555" : "#aaa") }}>
                      {t("auth.businessRegister.noVatRegistered")}
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleVatSelect(true)}
                    style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", backgroundColor: isVatRegistered ? "#04ecc1" : "transparent" }}
                  >
                    <CustomText style={{ fontSize: 13, fontWeight: isVatRegistered ? "600" : "400", color: isVatRegistered ? "#004d40" : (theme === "dark" ? "#555" : "#aaa") }}>
                      {t("auth.businessRegister.vatRegistered")}
                    </CustomText>
                  </TouchableOpacity>
                </View>
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

              <TouchableOpacity
                onPress={() => router.push('/partner')}
                style={{
                  marginTop: 12,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#2D2D2D',
                  alignItems: 'center',
                }}
              >
                <CustomText style={{ color: '#04ecc1', fontWeight: '700', textAlign: 'center' }}>
                  {t('auth.businessRegister.join', 'JOIN PARTNER')}
                </CustomText>
              </TouchableOpacity>
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
