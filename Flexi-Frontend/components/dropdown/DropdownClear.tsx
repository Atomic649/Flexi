import { useState } from "react";
import { View, TouchableOpacity, ScrollView, Platform } from "react-native";
import { CustomText } from "../CustomText"; // Make sure to import CustomText
import { useTheme } from "@/providers/ThemeProvider";
import { t } from "i18next";

const Dropdown = ({
  title,
  options,
  selectedValue,
  onValueChange,
  placeholder,
  placeholderColor,
  otherStyles,
  borderColor,
  bgChoiceColor,
  textcolor,
  disabled = false,
  ...props
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const webScrollStyle = Platform.OS === "web" ? ({ overflowY: "auto" } as any) : undefined;

  const handlePress = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <View
      className={`space-y- mt-4 ${otherStyles}`}
      style={{ position: "relative" }}
    >
      {/* Floating label over the border */}
      {selectedValue ? (
        <CustomText
          className="text-base text-zinc-500 font-pmedium"
          style={{
            position: "absolute",
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
      <TouchableOpacity
        className="w-full px-4 rounded-2xl border-2 border-transparent flex flex-row items-center justify-between"
        onPress={handlePress}
        activeOpacity={1}
        style={{
          backgroundColor: "transparent",
          borderColor: borderColor ? borderColor : "transparent",
          borderWidth: borderColor ? 0.5 : 0,
          opacity: disabled ? 0.7 : 0.9,
          height: 50,
        }}
      >
        <CustomText
          className="font-psemibold text-lg  pt-1"
          style={{
            color: selectedValue
              ? theme === "dark"
                ? "#b4b3b3"
                : "#2a2a2a"
              : placeholderColor,
          }}
        >
          {selectedValue || placeholder}
        </CustomText>
        <CustomText
          className="text-zinc-300 font-psemibold text-lg"
          style={{ opacity: disabled ? 0.5 : 0.7 }}
        >
          {isOpen ? "▲" : "▼"}
        </CustomText>
      </TouchableOpacity>

      {isOpen && !disabled && (
        Array.isArray(options) && options.length > 0 ? (
          <View style={{ maxHeight: 260, borderRadius: 16, overflow: "hidden" }}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              persistentScrollbar
              style={[
                {
                  borderColor: borderColor ? borderColor : "transparent",
                  borderWidth: borderColor ? 0.0 : 0,
                },
                webScrollStyle,
              ]}
              contentContainerStyle={{ paddingVertical: 2 }}
              {...props}
            >
              {options.map((item: any) => (
                <TouchableOpacity
                  key={item.value}
                  className="w-full  px-4 flex-row items-center"
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                  style={{
                    backgroundColor: "#87878716",
                    borderColor: borderColor ? borderColor : "transparent",
                    borderWidth: 0.8,
                    borderRadius: 12,
                    opacity: disabled ? 0.7 : 0.9,
                    marginBottom: 0.05,
                    alignItems: 'center',
                    height: 50,
                  }}
                >
                  <CustomText
                    className="font-psemibold text-lg text-center"
                    style={{ color: textcolor }}
                  >
                    {item.label}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View
            pointerEvents="none"
            style={{
              borderRadius: 16,
              borderColor: borderColor ? borderColor : "transparent",
              borderWidth: borderColor ? 0.5 : 0,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <CustomText
              className="font-psemibold text-base"
              style={{ color: textcolor ?? '#8c8c8c' }}
            >
              {t('common.noOptions')}
            </CustomText>
          </View>
        )
      )}
    </View>
  );
};

export default Dropdown;
