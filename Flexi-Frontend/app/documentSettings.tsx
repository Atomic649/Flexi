import React, { useState } from "react";
import { ScrollView, Switch, Platform, Dimensions, TextInput, TouchableOpacity } from "react-native";
import { View } from "@/components/Themed";
import { CustomText } from "@/components/CustomText";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useDocumentSettings, DocumentSettingsState } from "@/providers/DocumentSettingsProvider";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";
import { useBusiness } from "@/providers/BusinessProvider";
import CallAPIBusiness from "@/api/business_api";
import { getMemberId } from "@/utils/utility";
import CustomAlert from "@/components/CustomAlert";

const getSwitchPlatformColors = (theme: string, value: boolean) => ({
  trackColor: {
    false: theme === "dark" ? "#4B5563" : "#D1D5DB",
    true: theme === "dark" ? "#04ecc1" : "#04ecc1",
  },
  thumbColor: value
    ? theme === "dark" ? "#ffffff" : "#ffffff"
    : theme === "dark" ? "#71717a" : "#75726a",
});

const toggleScaleStyle = { transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] };

interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  theme: string;
  textColorClass: string;
  isLast?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onToggle, theme, textColorClass, isLast }) => (
  <>
    <View
      className={`flex-row items-center justify-between px-4 py-3 ${
        theme === "dark" ? "bg-zinc-800" : "bg-zinc-100"
      }`}
    >
      <CustomText weight="regular" className={`text-base flex-1 ${textColorClass}`}>
        {label}
      </CustomText>
      <Switch
        value={value}
        onValueChange={onToggle}
        {...getSwitchPlatformColors(theme, value)}
        style={toggleScaleStyle}
      />
    </View>
    {!isLast && (
      <View style={{ height: 1, backgroundColor: theme === "dark" ? "#3f3f46" : "#e4e4e7" }} />
    )}
  </>
);

export default function DocumentSettings() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { settings, setSetting } = useDocumentSettings();
  const bgClass = useBackgroundColorClass();
  const textColorClass = useTextColorClass();
  const { paymentTerm: defaultPaymentTerm, remark: defaultRemark, fetchBusinessData } = useBusiness();

  const [paymentTermInput, setPaymentTermInput] = useState(defaultPaymentTerm ?? "");
  const [remarkInput, setRemarkInput] = useState(defaultRemark ?? "");
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: "", message: "" });

  // Sync inputs when BusinessProvider loads defaults
  React.useEffect(() => {
    setPaymentTermInput(defaultPaymentTerm ?? "");
  }, [defaultPaymentTerm]);

  React.useEffect(() => {
    setRemarkInput(defaultRemark ?? "");
  }, [defaultRemark]);

  const toggle = (key: keyof DocumentSettingsState) => {
    setSetting(key, !settings[key]);
  };

  const handleSaveDefaults = async () => {
    try {
      const memberId = await getMemberId();
      if (!memberId) return;
      await CallAPIBusiness.UpdateBusinessDefaultsAPI(memberId, {
        paymentTerm: paymentTermInput,
        remark: remarkInput,
      });
      fetchBusinessData();
      setAlertConfig({ visible: true, title: t("common.success") ?? "Success", message: t("documentSettings.defaults.saved") });
    } catch {
      setAlertConfig({ visible: true, title: t("common.error") ?? "Error", message: t("documentSettings.defaults.saveError") });
    }
  };

  const sectionStyle = `rounded-xl overflow-hidden border ${
    theme === "dark" ? "border-zinc-700" : "border-zinc-200"
  }`;

  const inputStyle = {
    borderWidth: 0.5,
    borderColor: theme === "dark" ? "#3f3f46" : "#e4e4e7",
    borderRadius: 10,
    padding: 10,
    color: theme === "dark" ? "#d4d4d8" : "#27272a",
    backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top" as const,
  };

  return (
    <View className={`h-full ${bgClass}`} style={Platform.OS === "web" ? { paddingTop: 60 } : {}}>
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={[{ text: t("common.ok"), onPress: () => setAlertConfig((p) => ({ ...p, visible: false })) }]}
      />
      <ScrollView>
        <View
          className="px-4 pt-3 pb-8"
          style={Dimensions.get("window").width > 768 ? { alignSelf: "center", width: "60%" } : {}}
        >
          {/* Bill Form Fields */}
          <View className="my-4">
            <CustomText weight="medium" className={`text-lg mb-1 ${textColorClass}`}>
              {t("documentSettings.billForm.title")}
            </CustomText>
            <CustomText className="text-sm mb-3" style={{ color: theme === "dark" ? "#71717a" : "#9ca3af" }}>
              {t("documentSettings.billForm.description")}
            </CustomText>
            <View className={sectionStyle}>
              <ToggleRow label={t("documentSettings.billForm.showNote")} value={settings.showNote} onToggle={() => toggle("showNote")} theme={theme} textColorClass={textColorClass} />
              <ToggleRow label={t("documentSettings.billForm.showPaymentTerms")} value={settings.showPaymentTerms} onToggle={() => toggle("showPaymentTerms")} theme={theme} textColorClass={textColorClass} />
              <ToggleRow label={t("documentSettings.billForm.showRemark")} value={settings.showRemark} onToggle={() => toggle("showRemark")} theme={theme} textColorClass={textColorClass} />
              <ToggleRow label={t("documentSettings.billForm.showWithholdingTax")} value={settings.showWithholdingTax} onToggle={() => toggle("showWithholdingTax")} theme={theme} textColorClass={textColorClass} />
              <ToggleRow label={t("documentSettings.billForm.showBillLevelDiscount")} value={settings.showBillLevelDiscount} onToggle={() => toggle("showBillLevelDiscount")} theme={theme} textColorClass={textColorClass} />
              <ToggleRow label={t("documentSettings.billForm.showProject")} value={settings.showProject} onToggle={() => toggle("showProject")} theme={theme} textColorClass={textColorClass} isLast />
            </View>
          </View>

          {/* Default Document Text */}
          <View className="my-4">
            <CustomText weight="medium" className={`text-lg mb-1 ${textColorClass}`}>
              {t("documentSettings.defaults.title")}
            </CustomText>
            <CustomText className="text-sm mb-3" style={{ color: theme === "dark" ? "#71717a" : "#9ca3af" }}>
              {t("documentSettings.defaults.description")}
            </CustomText>
            <View style={{ gap: 12 }}>
              <View>
                <CustomText className="text-sm mb-1" style={{ color: theme === "dark" ? "#a1a1aa" : "#52525b" }}>
                  {t("documentSettings.defaults.paymentTerm")}
                </CustomText>
                <TextInput
                  value={paymentTermInput}
                  onChangeText={setPaymentTermInput}
                  placeholder={t("documentSettings.defaults.paymentTermPlaceholder")}
                  placeholderTextColor={theme === "dark" ? "#52525b" : "#a1a1aa"}
                  multiline
                  maxLength={300}
                  style={inputStyle}
                />
              </View>
              <View>
                <CustomText className="text-sm mb-1" style={{ color: theme === "dark" ? "#a1a1aa" : "#52525b" }}>
                  {t("documentSettings.defaults.remark")}
                </CustomText>
                <TextInput
                  value={remarkInput}
                  onChangeText={setRemarkInput}
                  placeholder={t("documentSettings.defaults.remarkPlaceholder")}
                  placeholderTextColor={theme === "dark" ? "#52525b" : "#a1a1aa"}
                  multiline
                  maxLength={300}
                  style={inputStyle}
                />
              </View>
              <TouchableOpacity
                onPress={handleSaveDefaults}
                style={{
                  backgroundColor: "#04ecc1",
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <CustomText weight="medium" style={{ color: "#18181b", fontSize: 15 }}>
                  {t("documentSettings.defaults.save")}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>

          {/* PDF Display */}
          <View className="my-4">
            <CustomText weight="medium" className={`text-lg mb-1 ${textColorClass}`}>
              {t("documentSettings.pdf.title")}
            </CustomText>
            <CustomText className="text-sm mb-3" style={{ color: theme === "dark" ? "#71717a" : "#9ca3af" }}>
              {t("documentSettings.pdf.description")}
            </CustomText>
            <View className={sectionStyle}>
              <ToggleRow label={t("documentSettings.pdf.showProject")} value={settings.pdfShowProject} onToggle={() => toggle("pdfShowProject")} theme={theme} textColorClass={textColorClass} />
              <ToggleRow label={t("documentSettings.pdf.showWithholdingTax")} value={settings.pdfShowWithholdingTax} onToggle={() => toggle("pdfShowWithholdingTax")} theme={theme} textColorClass={textColorClass} />
              <ToggleRow label={t("documentSettings.pdf.showBranch")} value={settings.pdfShowBranch} onToggle={() => toggle("pdfShowBranch")} theme={theme} textColorClass={textColorClass} isLast />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
