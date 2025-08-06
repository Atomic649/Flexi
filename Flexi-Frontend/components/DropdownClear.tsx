import { useState } from "react";
import { View, TouchableOpacity, FlatList, Text } from "react-native";
import { CustomText } from "./CustomText"; // Make sure to import CustomText

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

  const handlePress = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <CustomText className="text-base text-zinc-500 font-pmedium mb-1">
        {title}
      </CustomText>
      <TouchableOpacity
        className="w-full h-14 px-4 rounded-2xl border-2 border-transparent flex flex-row items-center justify-between"
        onPress={handlePress}
        style={{
          backgroundColor: "transparent",
          borderColor: borderColor ? borderColor : "transparent",
          borderWidth: borderColor ? 0.5 : 0,
          opacity: disabled ? 0.7 : 0.8,
        }}
      >
        <CustomText
          className="font-psemibold text-lg"
          style={{ color: selectedValue ? textcolor : placeholderColor }}
        >
          {selectedValue || placeholder}
        </CustomText>
        <CustomText
          className="text-zinc-300 font-psemibold text-lg"
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          {isOpen ? "▲" : "▼"}
        </CustomText>
      </TouchableOpacity>

      {isOpen && !disabled && (
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="w-full h-16 px-4 rounded-2xl border-spacing-x-0.5 flex-row items-center"
              onPress={() => {
                onValueChange(item.value);
                setIsOpen(false);
              }}
              style={{
                backgroundColor: "#87878716",
                borderColor: borderColor ? borderColor : "transparent",
                borderWidth: 0.5,
                borderRadius: 12,
                opacity: disabled ? 0.5 : 0.8,             
       
              }}
            >
              <CustomText
                className="font-psemibold text-lg"
                style={{ color: textcolor }}
              >
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
