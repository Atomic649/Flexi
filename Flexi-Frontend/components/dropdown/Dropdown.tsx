import { useState, useEffect, useCallback, useMemo } from "react";
import { View, TouchableOpacity, ScrollView, Platform, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from '../CustomText';
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
      className={`space-y-2 ${otherStyles} relative`}
      style={{ position: "relative", zIndex: isOpen ? 2000 : 1 }}
    >
      {title && (
        <CustomText className="text-base text-zinc-500 font-pmedium mb-1 pl-1">
          {title}
        </CustomText>
      )}
      
      <View style={{ position: "relative", zIndex: isOpen ? 2000 : 1 }}>
        <TouchableOpacity
          className="w-full h-16 px-4 rounded-xl flex flex-row items-center justify-between z-50"
          onPress={handlePress}
          activeOpacity={0.8}
          style={{
            backgroundColor: bgColor || "#423f39",
            borderRadius: 16,
            borderWidth: 2,
            borderColor: bgColor || "#423f39",
            opacity: disabled ? 0.7 : 1
          }}
        >
          <CustomText
            className="font-psemibold text-base flex-1 mr-2"
            numberOfLines={1}
            style={{ color: textcolor || "white" }}
          >
            {selectedLabel}
          </CustomText>
          <Ionicons 
             name={isOpen ? "chevron-up" : "chevron-down"} 
             size={20} 
             color={disabled ? "#9CA3AF" : textcolor || "white"} 
           />
        </TouchableOpacity>

        {isOpen && !disabled && (
           <View 
            style={{ 
                position: 'absolute',
                top: 66, // Height of button + gap
                left: 0,
                right: 0,
                maxHeight: 260,
                backgroundColor: bgChoiceColor || (theme === "dark" ? "#18181b" : "#ffffff"), // stone-600 default replaced with theme
                borderRadius: 12,
                zIndex: 1000,
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            }}
           >
            {options && options.length >= 4 && (
            <View style={{ padding: 10 }}>
                <View
                  style={{
                    backgroundColor: bgColor ? "#57534e" : "#57534e", // dark mode fallback
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="search" size={18} color={textcolor || "white"} />
                  <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder={t("common.search")}
                    placeholderTextColor={textcolor ? "#d1d5db" : "#d6d3d1"}
                    style={{
                      flex: 1,
                      marginLeft: 8,
                      color: textcolor || "white",
                      fontSize: 14,
                      padding: 0,
                      fontFamily: i18n.language === "th" ? "IBMPlexSansThai-Medium" : "Poppins-Regular",
                    }}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText("")}>
                       <Ionicons name="close-circle" size={18} color={textcolor || "white"} />
                    </TouchableOpacity>
                  )}
                </View>
            </View>
            )}

            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              persistentScrollbar
              style={{
                 ...webScrollStyle,
                 maxHeight: 200,
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
                          className={`text-base ${isSelected ? "font-bold" : "font-pmedium"}`}
                          style={{ color: textcolor || "#f4f4f5" }} 
                      >
                        {item.label}
                      </CustomText>
                      {isSelected && (
                          <Ionicons name="checkmark" size={18} color={textcolor || "#f4f4f5"} />
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
                    style={{ color: textcolor || "#d6d3d1" }}
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
