import {
  ScrollView,
  Dimensions, // Import Dimensions for responsive width
  TouchableOpacity,
} from "react-native";
import { View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { CustomButton } from "@/components/CustomButton";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import CallAPIBusiness from "@/api/business_api";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { useTheme } from "@/providers/ThemeProvider";
import { getUserId } from "@/utils/utility";
import Dropdown2 from "@/components/Dropdown2";
import FormField2 from "@/components/FormField2";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBusiness } from "@/providers/BusinessProvider";
import { Ionicons } from "@expo/vector-icons";

export default function CreateBusiness() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { triggerFetch } = useBusiness();
  const [businessName, setbusinessName] = useState("");
  const [taxType, settaxType] = useState("");
  const [taxId, settaxId] = useState("");
  const [businessType, setbusinessType] = useState("");
  type DocumentTypeOption =
    | "Invoice"
    | "Receipt"
    | "Quotation"
    | "WithholdingTax";
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([
    "Receipt",
  ]);
  const [error, setError] = useState("");

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
    if (!businessName || !taxType || !taxId || !businessType) {
      setAlertConfig({
        visible: true,
        title: t("auth.register.validation.incomplete"),
        message: t("auth.register.validation.invalidData"),
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

    try {
      // Call the register API
      const userId = await getUserId();
      if (userId === null) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }

      const data = await CallAPIBusiness.CreateMoreBusinessAPI({
        businessName,
        taxId,
        businessType,
        taxType,
        userId,
        DocumentType: documentTypes.filter(
          (t) => t === "Invoice" || t === "Receipt" || t === "Quotation"
        ),
      });

      if (data.error) throw new Error(data.error);

      // Trigger business data refresh
      triggerFetch();

      setAlertConfig({
        visible: true,
        title: t("auth.register.alerts.success"),
        message: t("auth.register.alerts.successMessage"),
        buttons: [
          {
            text: t("auth.register.alerts.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              // Navigate back to profile page with a slight delay to ensure data refresh
              setTimeout(() => {
                router.replace("/profile");
              }, 500);
            },
          },
        ],
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle document type selection
  const handleDocumentTypeToggle = (type: DocumentTypeOption) => {
    // Don't allow unchecking Receipt as it's required
    if (type === "Receipt") return;
    setDocumentTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  return (
    <SafeAreaView
      className={`h-full ${useBackgroundColorClass()}`}
      style={{
        width: "100%", // Ensure full width
        alignSelf: "center", // Center the content on larger screens
      }}
    >
      <ScrollView
        style={{
          width: Dimensions.get("window").width > 768 ? "40%" : "100%",
          maxWidth: 600,
          alignSelf: "center", // Center the content on larger screens
        }}
      >
        <View
          className="flex-1 justify-center px-4 py-10"
          style={{
            width: "100%", // Ensure the inner container takes full width
          }}
        >
          <FormField2
            title={t("auth.businessRegister.businessName")}
            placeholder={t("auth.businessRegister.businessName")}
            value={businessName}
            handleChangeText={setbusinessName}
            otherStyles="mt-0"
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
          />

          <Dropdown2
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
            selectedValue={t(`auth.businessRegister.taxTypeOption.${taxType}`)}
            otherStyles="mt-7"
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
          />

          <FormField2
            title={t("auth.businessRegister.taxId")}
            placeholder={t("0000000000000")}
            value={taxId}
            handleChangeText={settaxId}
            otherStyles="mt-7"
            keyboardType="number-pad"
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
          />

          <Dropdown2
            title={t("auth.businessRegister.businessType")}
            options={[
              {
                label: t("auth.businessRegister.businessTypeOption.OnlineSale"),
                value: "OnlineSale",
              },
              {
                label: t("auth.businessRegister.businessTypeOption.Massage"),
                value: "Massage",
              },
              {
                label: t("auth.businessRegister.businessTypeOption.Restaurant"),
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
                label: t("auth.businessRegister.businessTypeOption.Influencer"),
                value: "Influencer",
              },
              {
                label: t("auth.businessRegister.businessTypeOption.Other"),
                value: "Other",
              },
            ]}
            placeholder={t("auth.businessRegister.chooseBusinessType")}
            selectedValue={t(
              `auth.businessRegister.businessTypeOption.${businessType}`
            )}
            onValueChange={setbusinessType}
            otherStyles="mt-7"
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
          />

          {/* Document Types Selection */}
          <View style={{ marginTop: 28 }}>
            <CustomText
              className={`text-base font-medium mb-3 ${useTextColorClass()}`}
            >
              {t("auth.businessRegister.documentTypes")}
            </CustomText>

            {(
              [
                "Quotation",
                "Invoice",
                "Receipt",
                "WithholdingTax",
              ] as DocumentTypeOption[]
            ).map((type) => (
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
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: documentTypes.includes(type)
                      ? "#04ecc1"
                      : theme === "dark"
                      ? "#666"
                      : "#ccc",
                    backgroundColor: documentTypes.includes(type)
                      ? "#04ecc1"
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {documentTypes.includes(type) && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <CustomText className={useTextColorClass()}>
                  {t(`auth.businessRegister.documentType.${type}`)}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>

          {error ? (
            <CustomText className="text-red-500 mt-4">{error}</CustomText>
          ) : null}
          {/* create business account */}
          <CustomButton
            title={t("auth.register.button")}
            handlePress={handleRegister}
            containerStyles="mt-7"
            textStyles="!text-white"
          />
        </View>
      </ScrollView>

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
