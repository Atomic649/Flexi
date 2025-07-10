import { ScrollView, Dimensions, SafeAreaView } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTranslation } from "react-i18next";

export default function TaxDoc() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView
        style={{
          width: Dimensions.get("window").width > 768 ? "100%" : "100%",
          alignSelf: "center", // Center the content on larger screens
        }}
      ></ScrollView>
    </SafeAreaView>
  );
}
