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
import Dropdown2 from "@/components/dropdown/Dropdown2";
import FormField2 from "@/components/formfield/FormField2";
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
  const [isVatRegistered, setIsVatRegistered] = useState(false);
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    // Check if all fields are filled
    if (!businessName || !taxType || !taxId || !businessType) {
      setLoading(false);
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
        setLoading(false);
        return;
      }

      const data = await CallAPIBusiness.CreateMoreBusinessAPI({
        businessName,
        taxId,
        businessType,
        taxType,
        userId,
        vat: isVatRegistered,
        DocumentType: documentTypes.filter(
          (t) => t === "Invoice" || t === "Receipt" || t === "Quotation"
        ),
      });

      if (data.error) throw new Error(data.error);

      // Trigger business data refresh
      triggerFetch();
      setLoading(false);

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
      setLoading(false);
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

          <FormField2
            title={t("auth.businessRegister.taxId")}
            placeholder={t("0000000000000")}
            value={taxId}
            handleChangeText={(text: string) => {
                  const filtered = text.replace(/[^0-9]/g, "").slice(0, 13);
                  settaxId(filtered);
                }}
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
            isLoading={loading}
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
