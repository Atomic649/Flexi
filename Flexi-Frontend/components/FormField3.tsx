import { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import { icons } from "../constants";
import { CustomText } from "./CustomText"; // Make sure to import CustomText
import { Ionicons } from "@expo/vector-icons";

const FormField = ({
  title,
  value,
  value2,
  value3,
  placeholder,
  placeholder3,
  handleChangeText,
  handleChangeText2,
  handleChangeText3,
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
  const [] = useState(false);

  return (
    <View className={`flex-row ${otherStyles}`}>
      <View
        className="flex-row items-center"
        style={{ width: "28%", paddingLeft: 10 }}
      >
        <CustomText
          className=" text-zinc-500 pt-1 mb-3"
          style={{
            fontSize: 14,
          }}
        >
          {title}
        </CustomText>
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
        className="px-2 rounded-2xl border-2 border-transparent flex-row items-center"
        style={{
          backgroundColor: bgColor,
          height: boxheight ? boxheight : 40,
          width: "33%",
          opacity: editable ? 1 : 0.8,
          marginRight: 5,
        }}
      >
        <TextInput
          className="flex-1 font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          onChangeText={handleChangeText}
          style={{ color: textcolor }}
          editable={editable}
          keyboardType="numeric"
          {...props}
        />
      </View>
      <View
        className="px-2 rounded-2xl border-2 border-transparent flex-row items-center"        style={{
          backgroundColor: bgColor,
          height: boxheight ? boxheight : 40,
          width: "33%",
          opacity: editable ? 1 : 0.8,
          marginRight: 4,
        }}
      >
        {value2 > 0 && (
          <TextInput
            className="flex-1 font-psemibold text-base"
            value={value2}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor}
            editable={false}
            style={{ color: textcolor }}
            keyboardType="numeric"
            {...props}
          />
        )}
      </View>
    </View>
  );
};

export default FormField;
