import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { CustomText } from "../CustomText";
import { CustomTextInput } from "../CustomTextInput";
import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  placeholderTextColor,
  textcolor,
  boxheight,
  icons,
  handlePress,
  borderColor ,
  editable = true,
  ...props
}: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  return (
    <View className={`mt-4 ${otherStyles}`} style={{ position: 'relative' }}>
      {/* Floating label over the border */}
      {value ? (
        
        <CustomText
          className="text-base font-pmedium"
          style={{
            position: 'absolute',
            top: -12,
            left: 24,
            backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
            paddingHorizontal: 4,
            zIndex: 2,
            fontSize: 14, 
            color: theme === "dark" ? "#606060" : "#b1b1b1",           
          }}
        >
          {title}
        </CustomText>
      ) : null}
        {icons && (
          <TouchableOpacity onPress={handlePress}
             style={{
            position: 'absolute',
            top: -12,
            right: 24,
            backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
            paddingHorizontal: 4,
            zIndex: 2,
                  
          }}>
          <Ionicons
            name={icons}
            size={18}
            color={"#71717a"}
            style={{ marginLeft: 8, marginBottom: 8, alignSelf: "center" }}
          />
          </TouchableOpacity>
        )}
    
      <View
        className="w-full px-4 rounded-xl border-2 border-transparent flex-row items-center"
        style={{
          backgroundColor: "transparent",
          borderColor: borderColor? borderColor : "transparent",
          borderWidth: borderColor ? 0.5 : 0,          
          height: boxheight ? boxheight : 50,
          opacity: editable ? 0.9 : 0.7,
        }}
      >
        <CustomTextInput
          className={`flex-1 font-psemibold text-lg item-center h-full ${boxheight ? 'mt-4' : ''}`}
          style={{ color: theme === "dark" ? "#b4b3b3" : "#2a2a2a" }}
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
                color={theme === "dark" ? "#b4b3b3" : "#2a2a2a"}
                style={{ opacity: editable ? 1 : 0.5 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
