import { useState } from "react";
import { View, TouchableOpacity, FlatList,Text } from "react-native";
import {CustomText} from './CustomText'; // Make sure to import CustomText

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
    ...props
}: any) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View className={`space-y-2 ${otherStyles}`}>
             <CustomText className="text-base text-zinc-500 font-pmedium mb-3">{title}</CustomText>
            <TouchableOpacity
                className="w-full h-16 px-4  rounded-2xl border-2 border-transparent flex flex-row items-center justify-between"
                onPress={() => setIsOpen(!isOpen)}
                style={{ backgroundColor: bgColor }}
            >
                <Text className="text-[#b1b1b1] font-psemibold text-base"
                style={{ color: textcolor }}>
                    {selectedValue || placeholder}
                    

                </Text>
                <Text className="text-zinc-300 font-psemibold text-base">
                    {isOpen ? "▲" : "▼"}
                </Text>
            </TouchableOpacity>

            {isOpen && (
                <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="w-full h-16 px-4  rounded-2xl border-1 border-transparent  flex flex-row items-center"
                            onPress={() => {
                                onValueChange(item.value);
                                setIsOpen(false);
                            }}
                            style={{ backgroundColor: bgChoiceColor }}
                        >
                            <Text className="font-psemibold text-base"
                            style={{ color: textcolor }}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {...props}
                />
            )}
        </View>
    );
};

export default Dropdown;