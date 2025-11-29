import { useState } from "react";
import { View, TouchableOpacity, FlatList, Text } from "react-native";
import { CustomText } from '../CustomText'; // Make sure to import CustomText
import { getResponsiveStyles } from "@/utils/responsive";

const Dropdown = ({
   
    options,
    selectedValue,
    onValueChange,
    placeholder,
    otherStyles,
    bgColor,
    bgChoiceColor,
    textcolor,
    disabled = false,
    ...props
}: any) => {
    const [isOpen, setIsOpen] = useState(false);

    const handlePress = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <View className={` ${otherStyles}`}>           
            <TouchableOpacity
                className="w-full h-12 px-4 rounded-2xl border-2 border-transparent flex-row items-center justify-between"
                onPress={handlePress}
                activeOpacity={1}
                style={{
                    backgroundColor: bgColor,
                    opacity: disabled ? 0.8 : 1
                }}
            >
                <CustomText className="text-[#6d6b6b] font-psemibold text-sm pt-2"
                weight="bold"
                    style={{ color: textcolor , fontSize: getResponsiveStyles().bodyFontSize,}}>
                    {selectedValue || placeholder}
                </CustomText>
                <CustomText className="text-zinc-300 font-psemibold text-sm" style={{ opacity: disabled ? 0.5 : 1 }}>
                    {isOpen ? "▲" : "▼"}
                </CustomText>
            </TouchableOpacity>

            {isOpen && !disabled && (
                <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="w-full h-12 px-4 rounded-2xl border-1 border-transparent flex flex-row items-center"
                            onPress={() => {
                                onValueChange(item.value);
                                setIsOpen(false);
                            }}
                            style={{ backgroundColor: bgChoiceColor }}
                        >
                            <CustomText className="font-psemibold text-sm pt-2"
                                style={{ color: textcolor, fontSize: getResponsiveStyles().bodyFontSize}}>
                                {item.label}
                            </CustomText>
                        </TouchableOpacity>
                    )}
                    {...props}
                />
            )}
        </View>
    );
};

export default Dropdown;