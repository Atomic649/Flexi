import { useTheme } from "@/providers/ThemeProvider";
import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Platform,
} from "react-native";
import CallAPIUser from "@/api/auth_api";
import CallAPIBusiness from "@/api/business_api";
import { getMemberId, getUserId, replaceMemberId } from "@/utils/utility";
import { ScrollView, View, Image } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "@/components/CustomText";
import { useBusiness } from "@/providers/BusinessProvider";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { fetchBusinessData, triggerFetch } = useBusiness();
  const [businessData, setBusinessData] = useState<any>([]);
  const [businessAvatar, setBusinessAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [businessAccChoice, setBusinessAccChoice] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [businessAccChoiceVisible, setBusinessAccChoiceVisible] =
    useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const pickImage = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";
      document.body.appendChild(input);

      input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (file) {
          console.log("Selected file:", file);

          const formData = new FormData();
          formData.append("businessAvatar", file); // Append the file directly

          try {
            // Call the API to upload the file
            const response = await CallAPIBusiness.UpdateBusinessAvatarAPI(
              businessData.id,
              formData
            );

            triggerFetch(); // Reload business data
            console.log("File uploaded successfully:", response);
            setBusinessAvatar(URL.createObjectURL(file)); // Update the local state with the new image
          } catch (error) {
            console.error("Error uploading file:", error);
          }
        }
      };

      input.click();
      document.body.removeChild(input);
    } else {
      // Native platform logic
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert(t("profile.avatar.permission"));
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setBusinessAvatar(result.assets[0].uri);
        console.log("Selected image URI:", result.assets[0].uri);
        try {
          const formData = new FormData();
          formData.append(
            "businessAvatar", // Ensure this matches the backend's expected field name
            {
              uri: result.assets[0].uri,
              name: `${businessData.id}_avatar.jpg`,
              type: "image/jpeg",
            } as unknown as Blob
          );

          await CallAPIBusiness.UpdateBusinessAvatarAPI(
            businessData.id,
            formData
          );
          triggerFetch(); // Reload business data
        } catch (error) {
          console.error("Error updating business avatar:", error);
        }
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBusinessData();

    setRefreshing(false);
  };

  // get user data from API
  const [userData, setUserData] = useState<any>({});
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userId = await getUserId();
        if (userId) {
          const response = await CallAPIUser.getUserAPI(userId);
          setUserData(response);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // get business data from API
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const memberId = await getMemberId();
        if (memberId !== null) {
          const response = await CallAPIBusiness.getBusinessDetailsAPI(
            memberId
          );
          setBusinessData(response);
        }
        triggerFetch(); // Reload business data
      } catch (error) {
        console.error("Error fetching business data:", error);
      }
    };
    fetchBusinessData();
  }, []);

  // get business account choice
  useEffect(() => {
    const fetchBusinessAccountChoice = async () => {
      try {
        const userId = await getUserId();
        if (userId) {
          const response = await CallAPIBusiness.getBusinessAccountChoiceAPI(
            userId
          );
          setBusinessAccChoice(response);
        }
      } catch (error) {
        console.error("Error fetching business account choice:", error);
      }
    };

    fetchBusinessAccountChoice();
  }, []);

  return (
    <SafeAreaView className={`h-full ${useBackgroundColorClass()}`}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: Platform.OS === "web" ? 20 : 0,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Section */}
        <View className="items-center mt-5">
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Image
              source={{
                uri: businessAvatar || businessData.businessAvatar || "",
              }}
              className="w-32 h-32 rounded-full"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={pickImage}
            className=" ml-32 flex flex-row items-center"
          >
            <FontAwesome
              name="camera"
              size={20}
              color={theme === "dark" ? "#c9c9c9" : "#48453e"}
            />
          </TouchableOpacity>
        </View>

        {/* Modal to view image */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPressOut={() => setImageModalVisible(false)}
          >
            <View className="flex-1 justify-center items-center bg-black bg-opacity-90">
              <Image
                source={{
                  uri: businessAvatar || businessData.businessAvatar || "",
                }}
                className="w-full h-full"
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => setImageModalVisible(false)}
                className="absolute top-0 right-0 p-4"
              ></TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* User Details */}
        <View className="mt-5">
          <Text
            className="text-lg font-bold text-center"
            style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}
          >
            {userData.firstName} {userData.lastName}
          </Text>
        </View>

        {/* Business Acc Choice*/}
        <View className="mt-4 px-8 mb-2 items-center font-bold">
          <TouchableOpacity onPress={() => setBusinessAccChoiceVisible(true)}>
            <View
              className="flex-row items-center justify-center rounded-full w-full px-2 p-3"
              style={{
                backgroundColor: theme === "dark" ? "#27272a" : "#48453e",
              }}
            >
              <CustomText
                className="text-sm font-bold text-center w-full"
                style={{
                  color: theme === "dark" ? "#c9c9c9" : "#ffffff",
                }}
              >
                {selectedBusiness || businessData.businessName}
              </CustomText>
            </View>
          </TouchableOpacity>
        </View>

        <Text
          className="text-sm text-center"
          style={{ color: theme === "dark" ? "#c9c9c9" : "#48453e" }}
        >
          {businessData.role}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/createBusiness")}
          className=" justify-center mt-10 flex-row items-center"
        >
          <Ionicons
            name="add-circle"
            size={48}
            color={theme === "dark" ? "#c9c9c9" : "#48453e"}
          />
        </TouchableOpacity>

        {/* Modal for Business Account Choice */}
        <Modal
          visible={businessAccChoiceVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setBusinessAccChoiceVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setBusinessAccChoiceVisible(false)}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme === "dark" ? "#000000b5" : "#cacacaa9",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
                padding: 16,
                borderRadius: 16,
                width: "80%",
                maxHeight: "80%",
              }}
            >
              <ScrollView>
                {businessAccChoice.map((business, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedBusiness(business.businessName);
                      setBusinessAccChoiceVisible(false);
                      triggerFetch(); // Reload business data
                      // Send value business.memberId
                      console.log(business.memberId);
                      replaceMemberId(business.memberId);
                    }}
                    style={{
                      padding: 10,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        theme === "dark" ? "#27272a" : "#e1e1e1",
                    }}
                  >
                    <CustomText
                      style={{
                        color: theme === "dark" ? "#c9c9c9" : "#48453e",
                      }}
                    >
                      {business.businessName}
                    </CustomText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
