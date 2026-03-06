import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { CustomText } from "../CustomText";
import { CustomTextInput } from "../CustomTextInput";
import { Ionicons } from "@expo/vector-icons";

const FormField = ({
  title,
  subtitle,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  bgColor,
  placeholderTextColor,
  textcolor,
  boxheight,
  icons,
  handlePress,
  editable = true,
  ...props
}: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <View className="flex-row items-center">
        {title && (
            <CustomText className="text-base text-zinc-500 font-pmedium mb-1 pl-1">
            {title}
            </CustomText>
        )}
        {subtitle && (
          <CustomText className="text-sm text-zinc-400 font-pregular mb-1 ml-2"
          onPress={() => {
            if (handlePress) {
              handlePress();
            }
          }}>
            {subtitle}
          </CustomText>
        )}
        {icons && (
          <Ionicons
            name={icons}
            size={18}
            color={"#71717a"}
            onPress={() => {
              if (handlePress) {
                handlePress();
              }
            }}
            style={{ marginLeft: 8, marginBottom: 8, alignSelf: "center" }}
          />
        )}        
      </View>
      <View
        className="w-full px-4 rounded-xl border-2 border-transparent flex-row items-center"
        style={{
          backgroundColor: bgColor,
          height: boxheight ? boxheight : 50,
          opacity: editable ? 1 : 0.8,
        }}
      >
        <CustomTextInput
          className="flex-1 font-psemibold text-base h-full"
          style={{ color: textcolor }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
          editable={editable}
          {...props}
        />

        {title === "Password" && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            disabled={!editable}
            style={{ marginLeft: 8 }}
          >
            <Ionicons
                name={!showPassword ? "eye" : "eye-off"}
                size={24}
                color={textcolor || "#989795"}
                style={{ opacity: editable ? 1 : 0.5 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
