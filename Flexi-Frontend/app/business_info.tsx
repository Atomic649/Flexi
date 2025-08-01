import { Dimensions, SafeAreaView, ScrollView, Switch, KeyboardAvoidingView, Platform } from "react-native";
import { View } from "@/components/Themed";
import { useRouter } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import CallAPIBusiness from "@/api/business_api";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { useTheme } from "@/providers/ThemeProvider";
import { getMemberId, getUserId } from "@/utils/utility";
import Dropdown2 from "@/components/Dropdown2";
import FormField2 from "@/components/FormField2";


export default function BusinessInfo() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [businessName, setbusinessName] = useState("");
  const [taxType, settaxType] = useState("");
  const [vatId, setvatId] = useState("");
  const [businessType, setbusinessType] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [error, setError] = useState("");

  // Add alert config state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
    }>;
  }>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const [isVatRegistered, setIsVatRegistered] = useState(false);
  const [businessAddress, setBusinessAddress] = useState("");

  // Handle exit business info CallAPI getBusinessDetailsAPI
  const handleExit = async () => {
    try {
      const memberId = await getMemberId();
      if (memberId === null) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }
      const data = await CallAPIBusiness.getBusinessDetailsAPI(memberId);
      console.log("data", data);

      setbusinessName(data.businessName || "");
      settaxType(data.taxType || "");
      setvatId(data.vatId || "");
      setbusinessType(data.businessType || "");
      setBusinessPhone(data.businessPhone || "");
      setIsVatRegistered(!!data.vat); // handle exited data
      setBusinessAddress(data.businessAddress || "");

      if (data.error) throw new Error(data.error);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Call handleExit on component mount to pre-fill the form
  useEffect(() => {
    handleExit();
  }, []);

  // Handle register new business
  const handleRegister = async () => {
    setError("");

    // Check if all fields are filled
    if (!businessName || !taxType || !vatId || !businessType || !businessAddress) {
      setAlertConfig({
        visible: true,
        title: t("auth.register.validation.incomplete"),
        message: t("auth.register.validation.invalidData"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
      return;
    }

    try {
      // Call the register API
      const userId = await getUserId();
      if (userId === null) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }

      const memberId = await getMemberId();
      if (memberId === null) {
        setError(t("auth.register.validation.invalidUserId"));
        return;
      }

      // Use memberId directly for the update API call
      const data = await CallAPIBusiness.UpdateBusinessDetailsAPI(memberId, {
        businessName,
        vatId,
        businessType,
        taxType,
        businessPhone,
        businessAddress,
        vat: isVatRegistered, // update data logic
      });

      if (data.error) throw new Error(data.error);

      setAlertConfig({
        visible: true,
        title: t("auth.register.alerts.success"),
        message: t("auth.register.alerts.successMessage"),
        buttons: [
          {
            text: t("auth.register.alerts.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.back();
            },
          },
        ],
      });

      // No need to navigate away again
    } catch (error: any) {
      console.error("Update business details error:", error);
      setError(error.message || "Failed to update business details");
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView
      className={`h-full ${useBackgroundColorClass()}`}
      style={{
        width: "100%",
        alignSelf: "center",
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          style={{
            width: Dimensions.get("window").width > 768 ? "40%" : "100%",
            maxWidth: 600,
            alignSelf: "center",
          }}
        >
          <View
            className="flex-1 justify-center px-4 py-10"
            style={{
              width: "100%", // Ensure the inner container takes full width
            }}
          >
            <FormField2
              title={t("auth.businessRegister.businessName")}
              placeholder={t("auth.businessRegister.businessName")}
              value={businessName} // Pre-fill with existing data
              handleChangeText={setbusinessName}
              otherStyles="mt-0"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
             
            />

            <Dropdown2
              title={t("auth.businessRegister.taxType")}
              options={[
                {
                  label: t("auth.businessRegister.taxTypeOption.Individual"),
                  value: "Individual",
                },
                {
                  label: t("auth.businessRegister.taxTypeOption.Juristic"),
                  value: "Juristic",
                },
              ]}
              placeholder={t("auth.businessRegister.taxType")}
              onValueChange={settaxType}
              selectedValue={t(`auth.businessRegister.taxTypeOption.${taxType}`)} // Pre-fill with existing data
              otherStyles="mt-7"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            {/* VAT Toggle */}
            <View className="flex-row items-center justify-between mt-7 mb-2">
              <CustomText className="mr-3">
                {isVatRegistered
                  ? t("auth.businessRegister.vatRegistered")
                  : t("auth.businessRegister.noVatRegistered")}
              </CustomText>
              <Switch
                value={isVatRegistered}
                onValueChange={setIsVatRegistered}
                trackColor={{ false: theme === "dark" ? "#606060" : "#b1b1b1", true: "#0feac2" }}
                thumbColor={isVatRegistered ? "#009688" : theme === "dark" ? "#222" : "#fff"}
              />
            </View>

            <FormField2
              title={t("auth.businessRegister.vatId")}
              placeholder={t("0000000000000")}
              value={vatId} // Pre-fill with existing data
              handleChangeText={setvatId}
              otherStyles="mt-7"
              keyboardType="number-pad"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            
            />

            <Dropdown2
              title={t("auth.businessRegister.businessType")}
              options={[
                {
                  label: t("auth.businessRegister.businessTypeOption.OnlineSale"),
                  value: "OnlineSale",
                },
                {
                  label: t("auth.businessRegister.businessTypeOption.Massage"),
                  value: "Massage",
                },
                {
                  label: t("auth.businessRegister.businessTypeOption.Restaurant"),
                  value: "Restaurant",
                },
                {
                  label: t("auth.businessRegister.businessTypeOption.Bar"),
                  value: "Bar",
                },
                {
                  label: t("auth.businessRegister.businessTypeOption.Cafe"),
                  value: "Cafe",
                },
                {
                  label: t("auth.businessRegister.businessTypeOption.Hotel"),
                  value: "Hotel",
                },
                {
                  label: t("auth.businessRegister.businessTypeOption.Tutor"),
                  value: "Tutor",
                },
                {
                  label: t("auth.businessRegister.businessTypeOption.Influencer"),
                  value: "Influencer",
                },
                {
                  label: t("auth.businessRegister.businessTypeOption.Other"),
                  value: "Other",
                },
              ]}
              placeholder={t("auth.businessRegister.chooseBusinessType")}
              selectedValue={t(`auth.businessRegister.businessTypeOption.${businessType}`)} // Pre-fill with existing data
              onValueChange={setbusinessType}
              otherStyles="mt-7"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            <FormField2
              title={t("auth.businessRegister.businessPhone")}
              placeholder={t("auth.businessRegister.businessPhone")}
              value={businessPhone}
              handleChangeText={setBusinessPhone}
              otherStyles="mt-7"
              keyboardType="phone-pad"
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            <FormField2
              title={t("auth.businessRegister.businessAddress")}
              placeholder={t("auth.businessRegister.businessAddress")}
              value={businessAddress}
              handleChangeText={setBusinessAddress}
              otherStyles="mt-7"
              boxheight={80}
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              placeholderTextColor={theme === "dark" ? "#606060" : "#b1b1b1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 200);
              }}
            />

            {error ? (
              <CustomText className="text-red-500 mt-4">{error}</CustomText>
            ) : null}

            <CustomButton
              title={
                businessName || taxType || vatId || businessType
                  ? t("auth.update.button") // Show "Update" if data exists
                  : t("auth.register.button") // Show "Register" if no data exists
              }
              handlePress={handleRegister}
              containerStyles="mt-7"
              textStyles="!text-white"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}
