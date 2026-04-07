import React from "react";
import { ScrollView, Switch, Platform, Dimensions } from "react-native";
import { View } from "@/components/Themed";
import { CustomText } from "@/components/CustomText";
import { useTheme } from "@/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { useDocumentSettings, DocumentSettingsState } from "@/providers/DocumentSettingsProvider";
import { useBackgroundColorClass, useTextColorClass } from "@/utils/themeUtils";

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

  const toggle = (key: keyof DocumentSettingsState) => {
    setSetting(key, !settings[key]);
  };

  const sectionStyle = `rounded-xl overflow-hidden border ${
    theme === "dark" ? "border-zinc-700" : "border-zinc-200"
  }`;

  return (
    <View className={`h-full ${bgClass}`} style={Platform.OS === "web" ? { paddingTop: 60 } : {}}>
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
