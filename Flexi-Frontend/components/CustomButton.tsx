import { ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { CustomText } from "./CustomText"; // Ensure this path is correct
import { useTextColorClass } from "@/utils/themeUtils";
import { useTheme } from "@/providers/ThemeProvider";

interface CustomButtonProps {
  title: string;
  handlePress: () => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
}

interface ButtonProps {
  title: string;
  onPress: () => void;
}

// Original CustomButton (Primary - High importance)
const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-[#04ecc1] rounded-xl min-h-[62px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      <CustomText className={`font-bold text-lg text-white ${textStyles}`}>
        {title}
      </CustomText>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

// Secondary Button (Important but not primary actions)
const SecondaryButton = ({
  title,
  handlePress,
  containerStyles,
  isLoading,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-[#72ffe5] opacity-80 border-1 border-[#0dd4ac] rounded-xl min-h-[62px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      <CustomText weight="bold" style={{ color: "#13b594", fontSize: 14 }}>
        {title}
      </CustomText>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

const GrayButton = ({
  title,
  handlePress,
  containerStyles,
  isLoading,
}: CustomButtonProps) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`${
        theme === "dark"
          ? "bg-[#333333] border-[#d1d5db]"
          : "bg-[#f3f4f6] border-[#d1d5db]"
      } rounded-xl min-h-[62px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      <CustomText
        weight="bold"
        style={{ color: theme === "dark" ? "#dadada" : "#666", fontSize: 14 }}
      >
        {title}
      </CustomText>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

// Dark Gray Button
const DarkGrayButton = ({
  title,
  handlePress,
  containerStyles,
  isLoading,
}: CustomButtonProps) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`${
        theme === "dark"
          ? "bg-[#dddddd] border-[#a9aaab]"
          : "bg-[#666] border-[#a9aaab]"
      } rounded-xl min-h-[50px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      <CustomText
        weight="bold"
        style={{
          color: theme === "dark" ? "#666" : "#fbfafa",
          fontSize: 14,
        }}
      >
        {title}
      </CustomText>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};
const MiniCustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-[#04ecc1] rounded-xl min-h-[50px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      <CustomText className={`font-bold text-lg text-white ${textStyles}`}>
        {title}
      </CustomText>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

// Reusable text-only button base used by several variants
interface TextButtonBaseProps extends Omit<CustomButtonProps, 'textStyles'> {
  color?: string; // text color
  textSize?: number;
}

const TextButtonBase = ({
  title,
  handlePress,
  containerStyles = '',
  isLoading = false,
  color = '#0dd4ac',
  textSize = 16,
}: TextButtonBaseProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-transparent rounded-xl min-h-[62px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? 'opacity-50' : ''
      }`}
      disabled={isLoading}
    >
      <CustomText weight="bold" style={{ color, fontSize: textSize }}>
        {title}
      </CustomText>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color={color}
          size="small"
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

// Specific variants kept for backward compatibility
const TextButton = (props: CustomButtonProps) => (
  <TextButtonBase {...props} color="#0dd4ac" textSize={16} />
);

const TextButtonComfirm = (props: CustomButtonProps) => (
  // fixed color typo (## -> #)
  <TextButtonBase {...props} color="#ff1713" textSize={16} />
);

const TextButtonCancle = (props: CustomButtonProps) => (
  <TextButtonBase {...props} color="#006eff" textSize={16} />
);


// Simple Button (Text-only button with theme support)
const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <CustomText className={`${useTextColorClass()}`}>{title}</CustomText>
    </TouchableOpacity>
  );
};

export {
  SecondaryButton,
  TextButton,
  Button,
  CustomButton,
  GrayButton,
  DarkGrayButton,
  MiniCustomButton,
  TextButtonComfirm,
  TextButtonCancle
};
