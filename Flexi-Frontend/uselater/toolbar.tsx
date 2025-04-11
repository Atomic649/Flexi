import React from "react";
import { router } from "expo-router";
import { icons } from "@/constants";
import {
  View,
  Platform,
  Modal,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { i18n } from "i18next";

// ปรับปรุง interface ของ TabIcon
interface TabIconProps {
  icon: any;
  color: string;
  focused: boolean;
  size?: "normal" | "large"; // เพิ่ม prop สำหรับกำหนดขนาด
  isImage?: boolean; // เพิ่ม prop สำหรับกำหนดว่าเป็น image หรือไม่
}

// ปรับปรุง TabIcon component
const TabIcon = ({ icon, color, focused, size = "normal", isImage = false }: TabIconProps) => {
  return (
    <View
      className={`
      flex items-center justify-center 
      ${size === "large" ? "mt-1" : ""}  // ขยับไอคอนขึ้นถ้าเป็นขนาดใหญ่
    `}
    >
      <View
        className={`
        flex items-center justify-center
        ${
          size === "large" ? "bg-[#ffffff00] p-3 rounded-full  "  : ""
        }  // เพิ่มพื้นหลังถ้าเป็นขนาดใหญ่
      `}
      >
        {isImage ? (
          <Image
            source={icon}
            resizeMode="contain"
            style={{ width: size === "large" ? 52 : 40, height: size === "large" ? 52 : 40 }}
          />
        ) : (
          <Image
            source={icon}
            resizeMode="contain"
            // Color Icon of Middle Tab
            tintColor={size === "large" ? "#ffffff" : color}
            className={size === "large" ? "w-9 h-9  " : "w-9 h-7"}
          />
        )}
      </View>
    </View>
  );
};

interface ToolbarProps {
  visible: boolean;
  onClose: () => void;
}

const Toolbar = ({ visible, onClose
    
 }: ToolbarProps) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const ModalComponent = Platform.OS === "web" ? View : Modal;

  return (
    <ModalComponent
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }}>
        <View className="flex-row justify-center items-end flex-1">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            className="flex-row rounded-t-full items-center justify-evenly"
            style={{
              backgroundColor: theme === "dark" ? "#18181b" : "#4e4b47",
              borderColor: theme === "dark" ? "#2c3030" : "#4e4b47",
              borderStyle: "solid",
              borderWidth: 1,
              width: Platform.OS === "web" ? "30%" : "95%",
              height: "7%",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              position: "relative",
              bottom: 95,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("ads")}
              className="flex items-center mx-2"
            >
              <TabIcon
                icon={icons.ads}
                color={getIconColor(theme)}
                focused={false}
              />
              <Text
                className="text-white"
                style={[ToolBarTextStyle(i18n, theme)]}
              >
                {t("tabs.ads")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("store")}
              className="flex items-center mx-2"
            >
              <TabIcon
                icon={icons.sell}
                color={getIconColor(theme)}
                focused={false}
              />
              <Text
                className="text-white"
                style={[ToolBarTextStyle(i18n, theme)]}
              >
                {t("tabs.sell")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("product")}
              className="flex items-center mx-2"
            >
              <TabIcon
                icon={icons.product}
                color={getIconColor(theme)}
                focused={false}
              />
              <Text
                className="text-white"
                style={[ToolBarTextStyle(i18n, theme)]}
              >
                {t("tabs.product")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("settings")}
              className="flex items-center mx-2"
            >
              <TabIcon
                icon={icons.setting}
                color={getIconColor(theme)}
                focused={false}
              />
              <Text
                className="text-white"
                style={[ToolBarTextStyle(i18n, theme)]}
              >
                {t("tabs.settings")}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </ModalComponent>
  );
};

export default Toolbar;

const ToolBarTextStyle = (i18n: i18n, theme: string) => ({
  // ปรับปรุงสีข้อความของ TabBar
  color: theme === "dark" ? "#a1a1a1" : "#ffffff",
  fontSize: 12,
  fontFamily:
    i18n.language === "th" ? "NotoSansThai-Regular" : "Poppins-Regular",
  marginTop: 2,
});

// Define a function to get the color based on the theme
const getIconColor = (theme: string) =>
  // ปรับปรุงสีไอคอนของ TabBar
  theme === "dark" ? "#a1a1a1" : "#ffffff";
