import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { CustomText } from "../CustomText";
import { CustomTextInput } from "../CustomTextInput";
import { Ionicons } from "@expo/vector-icons";

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
  secure,
  ...props
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isSecureField = (secure ?? title === "Password") === true;

  return (
    <View className={`space-y-2 ${otherStyles ?? ""}`}>
      <View className="flex-row items-center flex-wrap">
        <CustomText className="text-base text-zinc-500 font-pmedium mb-1 pl-1">
          {title}
        </CustomText>
        {subTitle && (
          <CustomText className="text-sm text-zinc-400 font-pmedium mb-1 ml-2">
            {subTitle}
          </CustomText>
        )}
      </View>
      <View className="w-full h-16 px-4 bg-[#423f39] rounded-xl border-2 border-[#423f39] flex-row items-center">
        <CustomTextInput
          key={isSecureField ? (showPassword ? "password-visible" : "password-hidden") : "plain"}
          className="flex-1 text-white font-psemibold text-lg h-full"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#989795"
          onChangeText={handleChangeText}
          {...props}
          secureTextEntry={isSecureField && !showPassword}
        />

        {isSecureField && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
          style={{ justifyContent: "center", alignItems: "center", marginLeft: 8 }}>
            <Ionicons 
                name={!showPassword ? "eye" : "eye-off"} 
                size={24} 
                color="#989795" 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
