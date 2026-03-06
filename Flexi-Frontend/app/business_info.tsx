import {
  Dimensions,
  ScrollView,
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

const COLOR_FAMILIES = [
  {
    name: "Gray",
    main: "#5e5e5e",
    shades: [
      "#b0b0b0",
      "#8a8a8a",
      "#72705f",
      "#5b5b4a",
      "#5e5e5e",
      "#4a4a4a",
      "#383838",
      "#2a2a2a",
      "#1a1a1a",
      "#101010",
      "#080808",
      "#000000",
    ],
  },
  {
    name: "Slate",
    main: "#475569",
    shades: [
      "#94a3b8",
      "#64748b",
      "#475569",
      "#374151",
      "#334155",
      "#1f2937",
      "#1e293b",
      "#111827",
      "#0f172a",
      "#0b1120",
      "#07090f",
      "#020617",
    ],
  },
  {
    name: "Blue",
    main: "#2563eb",
    shades: [
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#1e3a8a",
      "#1e306e",
      "#172554",
      "#0e1f4d",
      "#0a1640",
      "#070e2c",
      "#040820",
    ],
  },
  {
    name: "Indigo",
    main: "#4f46e5",
    shades: [
      "#a5b4fc",
      "#818cf8",
      "#6366f1",
      "#4f46e5",
      "#4338ca",
      "#3730a3",
      "#312e81",
      "#272580",
      "#1e1b4b",
      "#12104a",
      "#0d0b35",
      "#080620",
    ],
  },
  {
    name: "Green",
    main: "#16a34a",
    shades: [
      "#4ade80",
      "#22c55e",
      "#16a34a",
      "#15803d",
      "#166534",
      "#14532d",
      "#0f3d20",
      "#052e16",
      "#032b14",
      "#021d0d",
      "#011508",
      "#010d05",
    ],
  },
  {
    name: "Teal",
    main: "#0891b2",
    shades: [
      "#22d3ee",
      "#0891b2",
      "#0e7490",
      "#164e63",
      "#0c3547",
      "#07252e",
      "#00f9f0",
      "#01cba3",
      "#27938f",
      "#245a58",
      "#15403f",
      "#0e2928",
    ],
  },
  {
    name: "Red",
    main: "#dc2626",
    shades: [
      "#f87171",
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
      "#6b1414",
      "#571010",
      "#450a0a",
      "#3b0000",
      "#2a0000",
      "#1a0000",
    ],
  },
  {
    name: "Rose",
    main: "#be123c",
    shades: [
      "#fe6eaa",
      "#fd4d96",
      "#ee2b7c",
      "#d7055d",
      "#fe046c",
      "#860f40",
      "#fb7185",
      "#f43f5e",
      "#e11d48",      
      "#9f1239",     
      "#6e0f2e",
      "#3b0013",
     ],
  },
  {
    name: "Purple",
    main: "#9333ea",
    shades: [
      "#d8b4fe",
      "#c084fc",
      "#a855f7",
      "#9333ea",
      "#7c3aed",
      "#6d28d9",
      "#5b21b6",
      "#4c1d95",
      "#3b1374",
      "#2e1065",
      "#1e0a45",
      "#110630",
    ],
  },
  {
    name: "Orange",
    main: "#ea580c",
    shades: [
      "#fb923c",
      "#f97316",
      "#ea580c",
      "#c2410c",
      "#9a3412",
      "#7c2d12",
      "#6c2409",
      "#5a1e06",
      "#431407",
      "#3a1003",
      "#280b02",
      "#180601",
    ],
  },
  {
    name: "Yellow",
    main: "#eab308",
    shades: [
      "#fde047",
      "#facc15",
      "#eab308",
      "#ca8a04",
      "#a16207",
      "#854d0e",
      "#713f12",
      "#5a3010",
      "#3f2008",
      "#2a1505",
      "#1a0d03",
      "#0f0801",
    ],
  },
  {
    name: "Brown",
    main: "#a0522d",
    shades: [
      "#d4a27a",
      "#c08052",
      "#a0522d",
      "#8b4513",
      "#7a3b11",
      "#6b3010",
      "#5c2a0e",
      "#4a200a",
      "#381808",
      "#281005",
      "#1a0a03",
      "#100602",
    ],
  },
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
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);

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
      setBusinessColor(data.businessColor || "#5e5e5e"); // default gray
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
              <TouchableOpacity
                onPress={handlePickLogo}
                style={{ alignItems: "center" }}
              >
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
                  className={`mt-2 text-sm pt-1 ${useTextColorClass()}`}
                  style={{ opacity: 0.6 }}
                >
                  {t("auth.businessRegister.tapToChangeLogo") ||
                    "Tap to change logo"}
                </CustomText>
              </TouchableOpacity>
            </View>

            {/* Business Color Picker */}
            <View style={{ marginBottom: 24 }}>
              <CustomText
                className={`text-base font-medium mb-3 ${useTextColorClass()}`}
              >
                {t("auth.businessRegister.brandColor") ||
                  "Brand Color (PDF Theme)"}
              </CustomText>

              {/* 8 main color family circles */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                {COLOR_FAMILIES.map((family, index) => {
                  const isFamilyActive = family.shades.includes(businessColor);
                  const isOpen = selectedFamily === index;
                  return (
                    <TouchableOpacity
                      key={family.name}
                      onPress={() => setSelectedFamily(isOpen ? null : index)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: family.main,
                        borderWidth: isOpen || isFamilyActive ? 3 : 1.5,
                        borderColor:
                          isOpen || isFamilyActive
                            ? theme === "dark"
                              ? "#fff"
                              : "#111"
                            : "rgba(0,0,0,0.15)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isFamilyActive && !isOpen && (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      )}
                      {isOpen && (
                        <Ionicons name="chevron-up" size={14} color="#fff" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sub-shade picker panel */}
              {selectedFamily !== null && (
                <View
                  style={{
                    marginTop: 4,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: theme === "dark" ? "#2D2D2D" : "#f0f0f0",
                    borderWidth: 1,
                    borderColor: theme === "dark" ? "#444" : "#ddd",
                  }}
                >
                  <CustomText
                    className={useTextColorClass()}
                    style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}
                  >
                    {COLOR_FAMILIES[selectedFamily].name}
                  </CustomText>
                  {[0, 1].map((rowIdx) => (
                    <View
                      key={rowIdx}
                      style={{
                        flexDirection: "row",
                        gap: 6,
                        marginBottom: rowIdx === 0 ? 6 : 0,
                      }}
                    >
                      {COLOR_FAMILIES[selectedFamily].shades
                        .slice(rowIdx * 6, rowIdx * 6 + 6)
                        .map((shade) => (
                          <TouchableOpacity
                            key={shade}
                            onPress={() => {
                              setBusinessColor(shade);
                              setSelectedFamily(null);
                            }}
                            style={{
                              flex: 1,
                              height: 36,
                              borderRadius: 6,
                              backgroundColor: shade,
                              borderWidth: businessColor === shade ? 3 : 1,
                              borderColor:
                                businessColor === shade
                                  ? theme === "dark"
                                    ? "#fff"
                                    : "#111"
                                  : "rgba(0,0,0,0.1)",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {businessColor === shade && (
                              <Ionicons
                                name="checkmark"
                                size={12}
                                color="#fff"
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                    </View>
                  ))}
                </View>
              )}

              {/* Current color preview */}
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
                <CustomText
                  className={useTextColorClass()}
                  style={{ fontSize: 12 }}
                >
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
                  label: t(
                    "auth.businessRegister.businessTypeOption.OnlineSale",
                  ),
                  value: "OnlineSale",
                },
                {
                  label: t("auth.businessRegister.businessTypeOption.Massage"),
                  value: "Massage",
                },
                {
                  label: t(
                    "auth.businessRegister.businessTypeOption.Restaurant",
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
                    "auth.businessRegister.businessTypeOption.Influencer",
                  ),
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
