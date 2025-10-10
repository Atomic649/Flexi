import { useState } from "react";
import { View, TouchableOpacity, FlatList, Text } from "react-native";
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
  ...props
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <CustomText className="text-base text-zinc-500 font-pmedium mb-4">
        {title}
      </CustomText>
      <TouchableOpacity
        className="w-full h-16 px-4 bg-[#423f39]  rounded-2xl border-2 border-[#423f39] flex flex-row items-center justify-between"
        onPress={() => setIsOpen(!isOpen)}
      >
        <CustomText
          className="font-psemibold text-base"
          style={{ color: textcolor || "white" }} // Use provided text color or default
          
        >
          {selectedValue || placeholder}
        </CustomText>
        <CustomText className="text-zinc-300 font-psemibold text-base">
          {isOpen ? "▲" : "▼"}
        </CustomText>
      </TouchableOpacity>

      {isOpen && (
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="w-full h-16 px-4 bg-stone-600 rounded-2xl border-1 border-stone-200  flex-row items-center"
              onPress={() => {
                onValueChange(item.value);
                setIsOpen(false);
              }}
            >
              <CustomText className="text-zinc-100 font-psemibold text-base"
                style={{ color: textcolor || "#f4f4f5" }} >{/* Use provided text color or default */}
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
