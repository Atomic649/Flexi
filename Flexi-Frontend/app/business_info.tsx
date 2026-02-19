import {
  Dimensions,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { CustomButton } from "@/components/CustomButton";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import CallAPIBusiness from "@/api/business_api";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { useTheme } from "@/providers/ThemeProvider";
import { getMemberId, getUserId } from "@/utils/utility";
import Dropdown2 from "@/components/dropdown/Dropdown2";
import FormField2 from "@/components/formfield/FormField2";
import { Ionicons } from "@expo/vector-icons";
import { isDesktop } from "@/utils/responsive";
import * as ImagePicker from "expo-image-picker";
import { useBusiness } from "@/providers/BusinessProvider";

const PRESET_COLORS = [
  "#5e5e5e",
  "#1e40af",
  "#15803d",
  "#b91c1c",
  "#7e22ce",
  "#c2410c",
  "#0369a1",
  "#0f766e",
  "#be123c",
  "#92400e",
  "#374151",
  "#000000",
];

export default function BusinessInfo() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { triggerFetch } = useBusiness();
  const [businessName, setbusinessName] = useState("");
  const [businessUserName, setBusinessUserName] = useState("@");
  const [taxType, settaxType] = useState("");
  const [taxId, settaxId] = useState("");
  const [businessType, setbusinessType] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  type DocumentTypeOption =
    | "Invoice"
    | "Receipt"
    | "Quotation"
    | "WithholdingTax";
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([
    "Receipt",
  ]);
  const [error, setError] = useState("");

  // Logo and color state
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoChanged, setLogoChanged] = useState(false);
  const [businessColor, setBusinessColor] = useState<string>("#5e5e5e");
  const [businessId, setBusinessId] = useState<number | null>(null);

  // Ensure business username always begins with a single '@' and cannot be removed
  const normalizeBusinessUserName = (value: string) => {
    const cleaned = value.replace(/\s/g, "").replace(/^@+/, "");
    return "@" + cleaned;
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

  const [isVatRegistered, setIsVatRegistered] = useState(false);
  const [businessAddress, setBusinessAddress] = useState("");

  // Handle document type selection
  const handleDocumentTypeToggle = (type: DocumentTypeOption) => {
    if (type === "Receipt") return;
    setDocumentTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Handle exit business info CallAPI getBusinessDetailsAPI
  const handleExit = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId === null) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }
      const data = await CallAPIBusiness.getBusinessDetailsAPI(memberId);

      setbusinessName(data.businessName || "");
      setBusinessUserName(
        normalizeBusinessUserName(data.businessUserName || ""),
      );
      settaxType(data.taxType || "");
      settaxId(data.taxId || "");
      setbusinessType(data.businessType || "");
      setBusinessPhone(data.businessPhone || "");
      setIsVatRegistered(!!data.vat);
      setBusinessAddress(data.businessAddress || "");
      setDocumentTypes(data.DocumentType || ["Receipt"]);
      setLogoUri(data.logo || null);
      setBusinessColor(data.businessColor || "#5e5e5e");
      setBusinessId(data.id || null);

      if (data.error) throw new Error(data.error);
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    handleExit();
  }, []);

  // Pick logo image
  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setLogoUri(result.assets[0].uri);
      setLogoChanged(true);
    }
  };

  // Handle save
  const handleRegister = async () => {
    setError("");

    if (
      !businessName ||
      !taxType ||
      !taxId ||
      !businessType ||
      !businessAddress
    ) {
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
      const userId = await getUserId();
      if (userId === null) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }

      const memberId = await getMemberId();
      if (memberId === null) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }

      // Update main details (including businessColor)
      console.log("🎨 Sending businessColor:", businessColor);
      const data = await CallAPIBusiness.UpdateBusinessDetailsAPI(memberId, {
        businessName,
        businessUserName,
        taxId,
        businessType,
        taxType,
        businessPhone,
        businessAddress,
        vat: isVatRegistered,
        DocumentType: documentTypes,
        businessColor,
      });

      if (data.error) throw new Error(data.error);

      // Upload logo if changed
      if (logoChanged && logoUri) {
        const formData = new FormData();
        if (Platform.OS === "web") {
          const response = await fetch(logoUri);
          const blob = await response.blob();
          formData.append("image", blob, "logo.jpg");
        } else {
          formData.append("image", {
            uri: logoUri,
            name: "logo.jpg",
            type: "image/jpeg",
          } as unknown as Blob);
        }
        await CallAPIBusiness.UpdateBusinessLogoAPI(memberId, formData);
      }

      // Refresh BusinessProvider
      triggerFetch();

      setAlertConfig({
        visible: true,
        title: t("auth.register.alerts.updatedSuccess"),
        message: t("auth.register.alerts.updatedsuccessMessage"),
        buttons: [
          {
            text: t("auth.register.alerts.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.back();
            },
          },
        ],
      });
    } catch (error: any) {
      console.error("Update business details error:", error);
      setError(error.message || "Failed to update business details");
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View
      className={`h-full ${useBackgroundColorClass()}`}
      style={{ width: "100%", alignSelf: "center" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          style={{
            width: isDesktop() ? "40%" : "100%",
            maxWidth: 600,
            alignSelf: "center",
          }}
        >
          <View
            className="flex-1 justify-center px-4 py-10"
            style={{ width: "100%" }}
          >
            {/* Logo Picker */}
            <View style={{ marginBottom: 24, alignItems: "center" }}>
              <CustomText
                className={`text-base font-medium mb-3 ${useTextColorClass()}`}
              >
                {t("auth.businessRegister.logo") || "Business Logo"}
              </CustomText>
              <TouchableOpacity onPress={handlePickLogo} style={{ alignItems: "center" }}>
                {logoUri ? (
                  <Image
                    source={{ uri: logoUri }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: businessColor || "#5e5e5e",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderStyle: "dashed",
                      borderColor: theme === "dark" ? "#666" : "#ccc",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme === "dark" ? "#2D2D2D" : "#f5f5f5",
                    }}
                  >
                    <Ionicons
                      name="image-outline"
                      size={36}
                      color={theme === "dark" ? "#666" : "#ccc"}
                    />
                  </View>
                )}
                <CustomText
                  className={`mt-2 text-sm ${useTextColorClass()}`}
                  style={{ opacity: 0.6 }}
                >
                  {t("auth.businessRegister.tapToChangeLogo") || "Tap to change logo"}
                </CustomText>
              </TouchableOpacity>
            </View>

            {/* Business Color Picker */}
            <View style={{ marginBottom: 24 }}>
              <CustomText
                className={`text-base font-medium mb-3 ${useTextColorClass()}`}
              >
                {t("auth.businessRegister.brandColor") || "Brand Color (PDF Theme)"}
              </CustomText>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setBusinessColor(color)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: color,
                      borderWidth: businessColor === color ? 3 : 1,
                      borderColor:
                        businessColor === color
                          ? theme === "dark"
                            ? "#fff"
                            : "#111"
                          : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {businessColor === color && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: businessColor,
                    borderWidth: 1,
                    borderColor: theme === "dark" ? "#555" : "#ccc",
                  }}
                />
                <CustomText className={useTextColorClass()} style={{ fontSize: 12 }}>
                  {businessColor}
                </CustomText>
              </View>
            </View>

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

            <FormField2
              title={t("auth.register.username") || "Business Username"}
              placeholder={t("auth.register.username") || "Business Username"}
              value={businessUserName}
              handleChangeText={(text: string) =>
                setBusinessUserName(normalizeBusinessUserName(text))
              }
              otherStyles="mt-7"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
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
              selectedValue={t(
                `auth.businessRegister.taxTypeOption.${taxType}`,
              )}
              otherStyles="mt-7"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            {/* VAT Toggle */}
            <View className="flex-row items-center justify-between mt-7 mb-2">
              <CustomText className="mr-3">
                {isVatRegistered
                  ? t("auth.businessRegister.vatRegistered")
                  : t("auth.businessRegister.noVatRegistered")}
              </CustomText>
              <Switch
                value={isVatRegistered}
                onValueChange={setIsVatRegistered}
                trackColor={{
                  false: theme === "dark" ? "#606060" : "#b1b1b1",
                  true: "#04ecc1",
                }}
                thumbColor={
                  isVatRegistered
                    ? "#009688"
                    : theme === "dark"
                      ? "#222"
                      : "#fff"
                }
              />
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
                `auth.businessRegister.businessTypeOption.${businessType}`,
              )}
              onValueChange={setbusinessType}
              otherStyles="mt-7"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            <FormField2
              title={t("auth.businessRegister.businessPhone")}
              placeholder={t("auth.businessRegister.businessPhone")}
              value={businessPhone}
              handleChangeText={(text: string) => {
                const filtered = text.replace(/[^0-9]/g, "").slice(0, 10);
                setBusinessPhone(filtered);
              }}
              otherStyles="mt-7"
              keyboardType="phone-pad"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            <FormField2
              title={t("auth.businessRegister.businessAddress")}
              placeholder={t("auth.businessRegister.businessAddress")}
              value={businessAddress}
              handleChangeText={setBusinessAddress}
              otherStyles="mt-7"
              boxheight={80}
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
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

            <CustomButton
              title={
                businessName || taxType || taxId || businessType
                  ? t("auth.update.button")
                  : t("auth.register.button")
              }
              handlePress={handleRegister}
              containerStyles="mt-7"
              textStyles="!text-white"
            />
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
    </View>
  );
}
