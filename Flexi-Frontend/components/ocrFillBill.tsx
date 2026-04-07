import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { CustomText } from "@/components/CustomText";
import { CustomButton, GrayButton } from "@/components/CustomButton";
import FormFieldClear from "@/components/formfield/FormFieldClear";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { isMobile } from "@/utils/responsive";
import { parseAutoFillInput, ParsedCustomerInfo } from "@/components/autoFillBill";
import CallAPIBill from "@/api/bill_api";

type OCRFillBillProps = {
  onApply: (data: ParsedCustomerInfo) => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const OCRFillBill: React.FC<OCRFillBillProps> = ({ onApply, containerStyle }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      if (!permissionResult.canAskAgain) {
        Alert.alert(
          t("bill.ocr.permissionTitle", { defaultValue: "ไม่ได้รับสิทธิ์เข้าถึงรูปภาพ" }),
          t("bill.ocr.permissionSettingsMsg", {
            defaultValue: "กรุณาเปิดสิทธิ์เข้าถึงรูปภาพในการตั้งค่า: Settings > Privacy > Photos > Flexi",
          }),
          [
            { text: t("common.cancel", { defaultValue: "ยกเลิก" }), style: "cancel" },
            {
              text: t("bill.ocr.openSettings", { defaultValue: "เปิดการตั้งค่า" }),
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      } else {
        setError(t("bill.ocr.permissionDenied", { defaultValue: "ไม่ได้รับสิทธิ์เข้าถึงรูปภาพ" }));
        setModalVisible(true);
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      base64: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setExtractedText("");
    setError(null);
    setModalVisible(true);
    setIsProcessing(true);

    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        // Web: fetch blob from URI and append
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        formData.append("image", blob, "ocr-image.jpg");
      } else {
        // Native: append file reference
        const mimeType = asset.mimeType ?? "image/jpeg";
        const ext = mimeType.split("/")[1] ?? "jpg";
        formData.append("image", {
          uri: asset.uri,
          name: `ocr-image.${ext}`,
          type: mimeType,
        } as any);
      }

      const { text } = await CallAPIBill.ocrExtractAPI(formData);
      setExtractedText(text);
    } catch (e: any) {
      setError(
        e?.message ??
          t("bill.ocr.failed", { defaultValue: "OCR ล้มเหลว กรุณาลองอีกครั้ง" })
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (!extractedText.trim()) {
      setError(t("bill.ocr.noText", { defaultValue: "ไม่พบข้อความในรูปภาพ" }));
      return;
    }
    const parsed = parseAutoFillInput(extractedText);
    if (!parsed) {
      setError(
        t("bill.autoFill.parseError", { defaultValue: "ไม่สามารถอ่านข้อมูลได้ กรุณาลองอีกครั้ง" })
      );
      return;
    }
    onApply(parsed);
    handleClose();
  };

  const handleClose = () => {
    setModalVisible(false);
    setExtractedText("");
    setError(null);
    setIsProcessing(false);
  };

  const isDark = theme === "dark";

  return (
    <>
      <TouchableOpacity
        onPress={handlePickImage}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[{ justifyContent: "center", alignItems: "center" }, containerStyle]}
      >
        <Ionicons name="scan" size={22} color="#03dbc1" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <TouchableWithoutFeedback
            onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss}
            accessible={false}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 12,
              }}
            >
              <View
                style={{
                  width: isMobile() ? "100%" : "60%",
                  maxWidth: 620,
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 12 }}
                  showsVerticalScrollIndicator={false}
                >
                  <CustomText
                    weight="bold"
                    style={{
                      fontSize: 18,
                      marginBottom: 10,
                      color: isDark ? "#e5e5e5" : "#333333",
                    }}
                  >
                    {t("bill.ocr.title", { defaultValue: "OCR สแกนรูปภาพ" })}
                  </CustomText>

                  {isProcessing ? (
                    <View style={{ alignItems: "center", paddingVertical: 32 }}>
                      <ActivityIndicator size="large" color="#03dbc1" />
                      <CustomText
                        style={{
                          marginTop: 12,
                          color: isDark ? "#9ca3af" : "#4b5563",
                          fontSize: 14,
                        }}
                      >
                        {t("bill.ocr.processing", { defaultValue: "กำลังอ่านข้อความจากรูปภาพ..." })}
                      </CustomText>
                    </View>
                  ) : (
                    <>
                      <CustomText
                        style={{
                          fontSize: 13,
                          color: isDark ? "#9ca3af" : "#4b5563",
                          marginBottom: 12,
                        }}
                      >
                        {t("bill.ocr.instructions", {
                          defaultValue: "ตรวจสอบและแก้ไขข้อความที่สกัดได้ก่อนกด ยืนยัน",
                        })}
                      </CustomText>
                      <FormFieldClear
                        title=""
                        value={extractedText}
                        handleChangeText={(value: string) => {
                          if (error) setError(null);
                          setExtractedText(value);
                        }}
                        placeholder={t("bill.ocr.placeholder", {
                          defaultValue: "ข้อความที่สกัดได้จากรูปภาพจะแสดงที่นี่",
                        })}
                        borderColor={isDark ? "#606060" : "#b1b1b1"}
                        placeholderTextColor={isDark ? "#606060" : "#b1b1b1"}
                        textcolor={isDark ? "#b1b1b1" : "#606060"}
                        otherStyles="mb-2"
                        multiline={true}
                        numberOfLines={15}
                        maxLength={1000}
                        boxheight={isTextInputFocused ? 150 : undefined}
                        onFocus={() => setIsTextInputFocused(true)}
                        onBlur={() => setIsTextInputFocused(false)}
                      />
                    </>
                  )}

                  {error && (
                    <CustomText
                      style={{ color: "#ef4444", marginBottom: 12, fontSize: 13 }}
                    >
                      {error}
                    </CustomText>
                  )}
                </ScrollView>

                <View style={{ flexDirection: "row", marginTop: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <GrayButton title={t("common.cancel")} handlePress={handleClose} />
                  </View>
                  {!isProcessing && (
                    <View style={{ flex: 1 }}>
                      <CustomButton
                        title={t("common.confirm")}
                        handlePress={handleConfirm}
                        containerStyles="bg-[#04ecc1]"
                        textStyles={isDark ? "text-[#18181b]" : "text-[#0f172a]"}
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default OCRFillBill;
