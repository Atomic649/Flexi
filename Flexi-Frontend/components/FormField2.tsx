import { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import { icons } from "../constants";
import { CustomText } from "./CustomText"; // Make sure to import CustomText
import { Ionicons } from "@expo/vector-icons";

const FormField = ({
  title,
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
  ...props
}: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <View className="flex-row items-center">
        <CustomText className="text-base text-zinc-500 font-pmedium mb-3">
          {title}
        </CustomText>
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
      </View>
      <View
        className="w-full h-16 px-4 rounded-2xl border-2 border-transparent flex flex-row items-center"
        style={{ backgroundColor: bgColor, height: boxheight ? boxheight : 56 }}
      >
        <TextInput
          className="flex-1 font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
          style={{ color: textcolor }}
          {...props}
        />

        {title === "Password" && (
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
