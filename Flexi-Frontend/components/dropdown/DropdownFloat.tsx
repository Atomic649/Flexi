import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomText } from "../CustomText";
import { CustomTextInput } from "../CustomTextInput";
import { useTheme } from "@/providers/ThemeProvider";
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
  disabled = false,
  onAddNew,
  ...props
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const containerRef = useRef<View>(null);
  const { theme } = useTheme();
  const borderColor = theme === "dark" ? "#555" : "#CCC";
  const bgChoiceColor = theme === "dark" ? "#333" : "#FFF";
  const webScrollStyle =
    Platform.OS === "web" ? ({ overflowY: "auto" } as any) : undefined;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
        // Measure position to decide open direction
        if (containerRef.current) {
          containerRef.current.measure((_x, _y, _width, height, _pageX, pageY) => {
            const screenHeight = Dimensions.get("window").height;
            const spaceBelow = screenHeight - keyboardHeight - (pageY + height);
            setOpenUpward(spaceBelow < 280);
          });
        }
        openDropdown(closeSelf);
        setIsOpen(true);
      }
    }
  };

  return (
    <View
      ref={containerRef}
      className={`mt-1 w-full ${otherStyles} relative`}
      style={{ position: "relative", zIndex: isOpen ? 2000 : 1 }}
    >
      {/* Floating label over the border */}
      {selectedValue && title ? (
        <CustomText
          className="text-zinc-500 font-pmedium"
          style={{
            position: "absolute",
            top: -12,
            left: 24,
            backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
            paddingHorizontal: 4,
            zIndex: 51, // Higher than button
            fontSize: 12,
            color: theme === "dark" ? "#606060" : "#b1b1b1",
          }}
        >
          {title}
        </CustomText>
      ) : null}

      <TouchableOpacity
        className="w-full px-4 rounded-xl flex flex-row items-center justify-between  DropdownFloat"
        onPress={handlePress}
        activeOpacity={1}
        style={{
          backgroundColor: "transparent",
          borderColor: theme === "dark" ? "#2c2c2cff" : "#c0beb550",
          borderWidth: borderColor ? 2 : 0,
          opacity: disabled ? 0.7 : 0.9,
          height: 50,
        }}
      >
        <CustomText
          className="font-psemibold text-base flex-1 mr-2"
          numberOfLines={1}
          style={{
            color: selectedValue
              ? theme === "dark"
                ? "#b4b3b3"
                : "#2a2a2a"
              : theme === "dark" ? "#504f4d" : "#c0beb5",
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

      {isOpen && !disabled && (
        <View
          style={{
            position: "absolute",
            ...(openUpward ? { bottom: 52 } : { top: 52 }),
            left: 0,
            right: 0,
            maxHeight: 260,
            backgroundColor:
              bgChoiceColor || (theme === "dark" ? "#18181b" : "#ffffff"),
            borderRadius: 12,
            borderWidth: borderColor ? 0.5 : 0,
            borderColor: borderColor || "transparent",
            zIndex: 2000,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: openUpward ? -2 : 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
        >
          {(options && options.length >= 4 || onAddNew) && (
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
              <CustomTextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder={onAddNew ? t("common.searchAdd") : t("common.search")}
                placeholderTextColor={theme === "dark" ? "#71717a" : "#a1a1aa"}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  color: theme === "dark" ? "#e4e4e7" : "#18181b",
                  fontSize: 14,
                  padding: 0,
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
                const itemTextColor = theme === "dark" ? "#e4e4e7" : "#18181b";

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
                  {t("common.noOptions")}
                </CustomText>
              </View>
            )}
            {onAddNew && searchText.trim().length > 0 &&
              !filteredOptions.some(
                (o: any) => o.label.toLowerCase() === searchText.trim().toLowerCase(),
              ) && (
                <TouchableOpacity
                  className="w-full py-3 px-4 flex flex-row items-center"
                  style={{
                    borderTopWidth: 0.5,
                    borderTopColor: theme === "dark" ? "#3f3f46" : "#e4e4e7",
                    gap: 8,
                  }}
                  onPress={() => {
                    onAddNew(searchText.trim());
                    closeSelf();
                    clearDropdown(closeSelf);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color={theme === "dark" ? "#60a5fa" : "#3b82f6"}
                  />
                  <CustomText
                    className="font-pmedium text-base"
                    style={{ color: theme === "dark" ? "#60a5fa" : "#3b82f6" }}
                  >
                    {`Add "${searchText.trim()}"`}
                  </CustomText>
                </TouchableOpacity>
              )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default Dropdown;
