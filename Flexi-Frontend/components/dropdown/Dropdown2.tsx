import { useState } from "react";
import { View, TouchableOpacity, ScrollView, Platform } from "react-native";
import { CustomText } from '../CustomText'; // Make sure to import CustomText

const Dropdown = ({
    title,
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
    const webScrollStyle = Platform.OS === "web" ? ({ overflowY: "auto" } as any) : undefined;

    const handlePress = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <CustomText className="text-base text-zinc-500 font-pmedium mb-3">{title}</CustomText>
            <TouchableOpacity
                className="w-full h-14 px-4 rounded-2xl border-2 border-transparent flex flex-row items-center justify-between"
                onPress={handlePress}
                 activeOpacity={1}
                style={{
                    backgroundColor: bgColor,
                    opacity: disabled ? 0.8 : 1
                }}
            >
                <CustomText className="text-[#b1b1b1] font-psemibold text-base"
                    style={{ color: textcolor }}>
                    {selectedValue || placeholder}
                </CustomText>
                <CustomText className="text-zinc-300 font-psemibold text-base" style={{ opacity: disabled ? 0.5 : 1 }}>
                    {isOpen ? "▲" : "▼"}
                </CustomText>
            </TouchableOpacity>

            {isOpen && !disabled && (
                <View style={{ maxHeight: 240, borderRadius: 16, overflow: 'hidden' }}>
                    <ScrollView
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator
                        persistentScrollbar
                        style={webScrollStyle}
                        {...props}
                    >
                        {options?.map((item: any) => (
                            <TouchableOpacity
                                key={item.value}
                                className="w-full h-16 px-4 border-1 border-transparent flex flex-row items-center"
                                onPress={() => {
                                    onValueChange(item.value);
                                    setIsOpen(false);
                                }}
                                style={{ backgroundColor: bgChoiceColor }}
                            >
                                <CustomText
                                    className="font-psemibold text-base"
                                    style={{ color: textcolor }}
                                >
                                    {item.label}
                                </CustomText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

export default Dropdown;