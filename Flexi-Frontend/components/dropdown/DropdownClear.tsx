import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "../CustomText"; // Make sure to import CustomText
import { useTheme } from "@/providers/ThemeProvider";
import i18n from "../../i18n"; // Import i18n instance
import { t } from "i18next";
import { openDropdown, clearDropdown } from "@/utils/dropdownManager";

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
  const [searchText, setSearchText] = useState("");
  const buttonRef = useRef<View>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const { theme } = useTheme();
  const webScrollStyle =
    Platform.OS === "web" ? ({ overflowY: "auto" } as any) : undefined;

  // Find selected label for display (fallback to selectedValue if check fails)
  const selectedLabel = Array.isArray(options)
    ? options.find(
        (o: any) => o.label === selectedValue || o.value === selectedValue,
      )?.label ||
      selectedValue ||
      placeholder
    : selectedValue || placeholder;

  const filteredOptions = useMemo(() => {
    if (!searchText) return options;
    if (!Array.isArray(options)) return [];

    return options.filter((option: any) =>
      option.label.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [options, searchText]);

  const closeSelf = useCallback(() => {
    setIsOpen(false);
    setSearchText(""); // Clear search when closing
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearDropdown(closeSelf);
    };
  }, [closeSelf]);

  const handlePress = () => {
    if (!disabled) {
      if (isOpen) {
        closeSelf();
        clearDropdown(closeSelf);
      } else {
        if (Platform.OS === "web" && buttonRef.current) {
          buttonRef.current.measure((_fx, _fy, w, h, px, py) => {
            setDropdownPos({ top: py + h, left: px, width: w });
            openDropdown(closeSelf);
            setIsOpen(true);
          });
        } else {
          openDropdown(closeSelf);
          setIsOpen(true);
        }
      }
    }
  };

  const dropdownContent = (
    <View
      style={{
        position: "absolute",
        top: Platform.OS === "web" ? dropdownPos.top : 52, // Height (50) + gap (2)
        left: Platform.OS === "web" ? dropdownPos.left : 0,
        right: Platform.OS === "web" ? undefined : 0,
        width: Platform.OS === "web" ? dropdownPos.width : undefined,
        maxHeight: 260,
        backgroundColor:
          bgChoiceColor || (theme === "dark" ? "#18181b" : "#ffffff"),
        borderRadius: 12,
        borderWidth: borderColor ? 0.5 : 0,
        borderColor: borderColor || "transparent",
        zIndex: 2000,
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
            backgroundColor: theme === "dark" ? "#27272a" : "#f4f4f5",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="search"
            size={18}
            color={theme === "dark" ? "#b1b1b1" : "#606060"}
          />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t("common.search")}
            placeholderTextColor={theme === "dark" ? "#71717a" : "#a1a1aa"}
            style={{
              flex: 1,
              marginLeft: 8,
              color: theme === "dark" ? "#e4e4e7" : "#18181b",
              fontSize: 14,
              padding: 0,
              fontFamily: i18n.language === "th" ? "IBMPlexSansThai-Medium" : "Poppins-Regular"

            }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme === "dark" ? "#71717a" : "#a1a1aa"}
              />
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
          maxHeight: 200, // Reduced max height to accommodate search bar
          borderRadius: 12,
        }}
        contentContainerStyle={{ paddingBottom: 4 }}
        {...props}
      >
        {Array.isArray(filteredOptions) && filteredOptions.length > 0 ? (
          filteredOptions.map((item: any, index: number) => {
            const isSelected =
              item.label === selectedValue || item.value === selectedValue;
            const itemTextColor = theme === "dark" ? "#e4e4e7" : "#18181b"; // zinc-200 : zinc-900

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
                  style={{ color: itemTextColor }}
                >
                  {item.label}
                </CustomText>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={itemTextColor}
                  />
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View
            pointerEvents="none"
            style={{
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <CustomText
              className="font-pmedium text-sm text-center"
              style={{ color: theme === "dark" ? "#a1a1aa" : "#71717a" }}
            >
              {Array.isArray(options) && options.length > 0
                ? t("common.noOptions")
                : t("common.noOptions")}
            </CustomText>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View
      className={`mt-4 ${otherStyles} relative`}
      style={{ position: "relative", zIndex: isOpen ? 2000 : 1 }}
    >
      {/* Floating label over the border */}
      {selectedValue && title ? (
        <CustomText
          className="text-base text-zinc-500 font-pmedium"
          style={{
            position: "absolute",
            top: -12,
            left: 24,
            backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
            paddingHorizontal: 4,
            zIndex: 51, // Higher than button
            fontSize: 14,
            color: theme === "dark" ? "#606060" : "#b1b1b1",
          }}
        >
          {title}
        </CustomText>
      ) : null}

      <TouchableOpacity
        className="w-full px-4 rounded-xl flex flex-row items-center justify-between  DropdownClear"
        ref={buttonRef}
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
          className="font-psemibold text-lg flex-1 mr-2"
          numberOfLines={1}
          style={{
            color: selectedValue
              ? theme === "dark"
                ? "#b4b3b3"
                : "#2a2a2a"
              : placeholderColor,
          }}
        >
          {selectedLabel}
        </CustomText>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={
            disabled ? "#9CA3AF" : theme === "dark" ? "#b1b1b1" : "#606060"
          }
        />
      </TouchableOpacity>

      {Platform.OS === "web" && isOpen ? (
        <Modal
          visible={isOpen}
          transparent
          animationType="none"
          onRequestClose={closeSelf}
        >
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={closeSelf}>
              <View style={{ flex: 1, backgroundColor: "transparent" }} />
            </TouchableWithoutFeedback>
            {dropdownContent}
          </View>
        </Modal>
      ) : (
        isOpen && !disabled && dropdownContent
      )}
    </View>
  );
};

export default Dropdown;
