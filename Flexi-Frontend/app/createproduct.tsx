import {
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { View } from "@/components/Themed";
import { useRouter } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import CallAPIProduct from "@/api/product_api";
import FormField2 from "@/components/FormField2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { getMemberId } from "@/utils/utility";
import { useTheme } from "@/providers/ThemeProvider";

export default function CreateProduct() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [name, setproductname] = useState("");
  const [description, setdescription] = useState("");
  const [barcode, setbarcode] = useState("");
  const [stock, setstock] = useState("");
  const [price, setprice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fieldStyles = "mt-2 mb-2";

  useEffect(() => {
    const fetchMemberId = async () => {
      const uniqueId = await AsyncStorage.getItem("uniqueId");
      setMemberId(uniqueId);
    };
    fetchMemberId();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

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

  const handleCreateProduct = async () => {
    setError("");

    if (!name || !description || !barcode || !stock || !price) {
      setAlertConfig({
        visible: true,
        title: t("product.validation.incomplete"),
        message: t("product.validation.invalidData"),
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
      const formData = new FormData();

      if (image) {
        formData.append("image", {
          uri: image,
          name: "image.jpg",
          type: "image/jpeg",
        } as unknown as Blob);
      }

      formData.append("name", name);
      formData.append("description", description);
      formData.append("barcode", barcode);
      formData.append("stock", stock);
      formData.append("price", price);
      formData.append("memberId", (await getMemberId()) || "");

      const data = await CallAPIProduct.createProductAPI(formData);

      if (data.error) {
        throw new Error(data.error);
      }

      setAlertConfig({
        visible: true,
        title: t("product.alerts.successTitle"),
        message: t("product.alerts.successMessage"),
        buttons: [
          {
            text: t("product.alerts.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              router.replace("(tabs)/product");
            },
          },
        ],
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${useBackgroundColorClass()}`}>
      <ScrollView>
        <View className="flex-1 justify-center h-full px-4 py-5 pb-20">
          {image && (
            <Image
              source={{ uri: image }}
              style={{ width: 350, height: 350 }}
              className="mt-4 mb-6 self-center rounded-md"
            />
          )}

          <FormField2
            title={t("product.productName")}
            value={name}
            handleChangeText={setproductname}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles="mt-0 mb-2"
          />

          <FormField2
            title={t("product.barcode")}
            value={description}
            handleChangeText={setdescription}
            otherStyles={fieldStyles}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            keyboardType="number-pad"
          />

          <FormField2
            title={t("product.description")}
            value={barcode}
            handleChangeText={setbarcode}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles={fieldStyles}
          />

          <View className="flex flex-row justify-between">
            <View className="w-1/2 pr-2">
              <FormField2
                title={t("product.stock")}
                value={stock}
                handleChangeText={setstock}
                otherStyles={fieldStyles}
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                keyboardType="number-pad"
              />
            </View>
            <View className="w-1/2 pl-2">
              <FormField2
                title={t("product.price")}
                value={price}
                handleChangeText={setprice}
                otherStyles={fieldStyles}
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={pickImage}
            className="mt-8 mb-2 items-center"
          >
            <Ionicons name="image" size={54} color="#cac9c8" />
            <CustomText className="text-center text-zinc-500 mt-1">
              {t("product.uploadImage")}
            </CustomText>
          </TouchableOpacity>

          {error ? (
            <CustomText className="text-red-500 mt-4">{error}</CustomText>
          ) : null}

          <CustomButton
            title={t("product.createbutton")}
            handlePress={handleCreateProduct}
            containerStyles="mt-5"
            textStyles="!text-white"
          />
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() =>
          setAlertConfig((prev) => ({ ...prev, visible: false }))
        }
      />
    </SafeAreaView>
  );
}