// components/LegalSection.tsx
import { View } from "react-native";
import { CustomText } from "./CustomText";
import { useTheme } from "@/providers/ThemeProvider";

type LegalSectionProps = {
  title: string;
  content: string[];
};

const LegalSection = ({ title, content }: LegalSectionProps) => {
  const { theme } = useTheme();
  
  return (
    <View className="mb-8">
      <CustomText 
        weight="semibold"
        className={`text-xl mb-2 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
        {title}
      </CustomText>
      
      {content.map((paragraph, i) => (
        <CustomText 
          key={i} 
          className={`leading-relaxed mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
          {paragraph}
        </CustomText>
      ))}
    </View>
  );
};

export default LegalSection;
