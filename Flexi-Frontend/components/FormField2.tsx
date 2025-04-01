import { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import { icons } from "../constants";
import {CustomText} from "./CustomText"; // Make sure to import CustomText

const FormField = ({
    title,
    value,
    placeholder,
    handleChangeText,
    otherStyles,
    bgColor,
    placeholderTextColor,
    textcolor,    
    theme,
    ...props
}: any) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <CustomText className="text-base text-zinc-500 font-pmedium mb-3">{title}</CustomText>
            <View className="w-full h-16 px-4 rounded-2xl border-2 border-transparent flex flex-row items-center"
            style={{ backgroundColor: bgColor }}>
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