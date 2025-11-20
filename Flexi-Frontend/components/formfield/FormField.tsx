import { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import { icons } from "../../constants";
import { CustomText } from "../CustomText";
import i18n from "../../i18n"; // Adjust the path if your i18n config is elsewhere

interface FormFieldProps {
  title: string;
  subTitle?: string; // optional subtitle
  value: string;
  placeholder?: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
  theme?: string;
  secure?: boolean; // if true, hide text and show eye toggle
  [key: string]: any; // allow extra props (e.g., keyboardType)
}

const FormField = ({
  title,
  subTitle,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  theme,
  ...props
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles ?? ""}`}>
      <View className="flex-row items-center flex-wrap">
        <CustomText className="text-base text-zinc-500 font-pmedium mb-4">
          {title}
        </CustomText>
        {subTitle && (
          <CustomText className="text-sm text-zinc-400 font-pmedium mb-4 ml-2">
            {subTitle}
          </CustomText>
        )}
      </View>
      <View className="w-full h-16 px-4 bg-[#423f39] rounded-2xl border-2 border-[#423f39] flex flex-row items-center">
        <TextInput
          className="flex-1 text-white font-psemibold text-lg"
          style={{
            fontFamily:
              i18n.language === "th"
                ? "IBMPlexSansThai-Medium"
                : "Poppins-Regular",
          }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#989795"
          onChangeText={handleChangeText}
          secureTextEntry={
            (props.secure ?? title === "Password") && !showPassword
          }
          {...props}
        />

        {(props.secure ?? title === "Password") && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyeHide}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
