import { useState, useEffect, useCallback, useMemo } from "react";
import { View, TouchableOpacity, ScrollView, Platform, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from '../CustomText';
import { getResponsiveStyles } from "@/utils/responsive";
import { openDropdown, clearDropdown } from "@/utils/dropdownManager";
import i18n from "../../i18n";
import { t } from "i18next";
import { useTheme } from "@/providers/ThemeProvider";

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
    const [searchText, setSearchText] = useState("");
    const { theme } = useTheme();
    const webScrollStyle = Platform.OS === "web" ? ({ overflowY: "auto" } as any) : undefined;
    
    // Find selected label for display
    const selectedLabel = options?.find((o: any) => o.label === selectedValue || o.value === selectedValue)?.label || selectedValue || placeholder;

    const filteredOptions = useMemo(() => {
        if (!searchText) return options;
        if (!Array.isArray(options)) return [];
        
        return options.filter((option: any) => 
          option.label.toLowerCase().includes(searchText.toLowerCase())
        );
      }, [options, searchText]);

    const closeSelf = useCallback(() => {
        setIsOpen(false);
        setSearchText("");
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => clearDropdown(closeSelf);
    }, [closeSelf]);

    const handlePress = () => {
        if (!disabled) {
            if (isOpen) {
                closeSelf();
                clearDropdown(closeSelf);
            } else {
                openDropdown(closeSelf);
                setIsOpen(true);
            }
        }
    };

    return (
        <View
            className={`${otherStyles} relative`}
            style={{ position: "relative", zIndex: isOpen ? 2000 : 1 }}
        >
            {title && (
                 <CustomText className="text-base text-zinc-500 font-pmedium mb-1 pl-1">
                    {title}
                </CustomText>
            )}
            
            <View style={{ position: "relative", zIndex: isOpen ? 2000 : 1 }}>
                <TouchableOpacity
                    className="w-full h-12 px-4 rounded-xl flex flex-row items-center justify-between z-50"
                    onPress={handlePress}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: bgColor,
                        borderRadius: 16,
                        opacity: disabled ? 0.7 : 1,
                        borderWidth: 2,
                        borderColor: 'transparent'
                    }}
                >
                    <CustomText 
                        className="font-psemibold text-sm flex-1 mr-2"
                        numberOfLines={1}
                        weight="bold"
                        style={{ 
                            color: textcolor, 
                            fontSize: getResponsiveStyles().bodyFontSize 
                        }}
                    >
                        {selectedLabel}
                    </CustomText>
                    <Ionicons 
                        name={isOpen ? "chevron-up" : "chevron-down"} 
                        size={18} 
                        color={disabled ? "#9CA3AF" : textcolor || "#6B7280"} 
                    />
                </TouchableOpacity>

                {isOpen && !disabled && (
                    <View 
                        style={{ 
                            position: 'absolute',
                            top: 50, // Height (48) + gap
                            left: 0,
                            right: 0,
                            maxHeight: 240,
                            backgroundColor: bgChoiceColor || (theme === "dark" ? "#18181b" : "#ffffff"),
                            borderRadius: 12,
                            zIndex: 1000,
                            elevation: 5,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                        }}
                    >
                        <View style={{ padding: 10 }}>
                            <View
                                style={{
                                    backgroundColor: "rgba(0,0,0,0.1)",
                                    borderRadius: 6,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Ionicons name="search" size={16} color={textcolor || "#6B7280"} />
                                <TextInput
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    placeholder={t("common.search")}
                                    placeholderTextColor={textcolor ? textcolor : "#9CA3AF"}
                                    style={{
                                        flex: 1,
                                        marginLeft: 6,
                                        color: textcolor || "#000",
                                        fontSize: 12, // match Dropdown3 smaller text style
                                        padding: 0,
                                        fontFamily: i18n.language === "th" ? "IBMPlexSansThai-Medium" : "Poppins-Regular",
                                    }}
                                />
                                {searchText.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchText("")}>
                                        <Ionicons name="close-circle" size={16} color={textcolor || "#6B7280"} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <ScrollView
                            nestedScrollEnabled
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator
                            persistentScrollbar
                            style={{
                                ...webScrollStyle,
                                maxHeight: 190, // Reduced to fit search input
                                borderRadius: 12,
                            }}
                            contentContainerStyle={{ paddingBottom: 4 }}
                            {...props}
                        >
                            {Array.isArray(filteredOptions) && filteredOptions.length > 0 ? (
                                filteredOptions.map((item: any, index: number) => {
                                    const isSelected = item.label === selectedValue || item.value === selectedValue;
                                    return (
                                        <TouchableOpacity
                                            key={item.value || index}
                                            className="w-full py-3 px-4 flex flex-row items-center justify-between"
                                            onPress={() => {
                                                onValueChange(item.value);
                                                closeSelf();
                                                clearDropdown(closeSelf);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <CustomText
                                                className={`text-sm ${isSelected ? "font-bold" : "font-pmedium"}`}
                                                style={{
                                                    color: textcolor,
                                                    fontSize: getResponsiveStyles().bodyFontSize // respect Dropdown3 font size
                                                }}
                                            >
                                                {item.label}
                                            </CustomText>
                                            {isSelected && (
                                                <Ionicons name="checkmark" size={16} color={textcolor} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <View
                                    pointerEvents="none"
                                    style={{
                                        paddingVertical: 12,
                                        alignItems: 'center',
                                    }}
                                >
                                    <CustomText
                                        className="font-pmedium text-sm text-center"
                                        style={{ color: textcolor || "#9CA3AF" }}
                                    >
                                        {t("common.noOptions")}
                                    </CustomText>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                )}
            </View>
        </View>
    );
};

export default Dropdown;