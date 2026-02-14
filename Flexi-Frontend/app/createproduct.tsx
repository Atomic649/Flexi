import {
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { View } from "@/components/Themed";
import { useRouter } from "expo-router";
import {CustomButton} from "@/components/CustomButton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import CallAPIProduct from "@/api/product_api";
import FormField2 from "@/components/formfield/FormField2";
import Dropdown2 from "@/components/dropdown/Dropdown2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { getMemberId } from "@/utils/utility";
import { useTheme } from "@/providers/ThemeProvider";
import { useBusiness } from "@/providers/BusinessProvider";

export default function CreateProduct() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { vat } = useBusiness();
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [name, setproductname] = useState("");
  const [description, setdescription] = useState("");
  const [barcode, setbarcode] = useState("");
  const [stock, setstock] = useState("");
  const [price, setprice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [unit, setUnit] = useState("");
  const [productType, setProductType] = useState("");

  const [units, setUnits] = useState<Array<{ label: string; value: string }>>(
    []
  );
  const [productTypes, setProductTypes] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const fieldStyles = "mt-2 mb-2";
  const isFieldEmpty = (value: string | null | undefined) =>
    !value || value.trim().length === 0;

  useEffect(() => {
    const fetchMemberId = async () => {
      const uniqueId = await AsyncStorage.getItem("uniqueId");
      setMemberId(uniqueId);
    };
    fetchMemberId();
  }, []);

  useEffect(() => {
    // Use the translated unit and product type options
    const fetchData = () => {
      setUnits([
        { label: t("product.units.piece"), value: "Piece" },
        { label: t("product.units.hour"), value: "Hour" },
        { label: t("product.units.course"), value: "Course" },
        { label: t("product.units.list"), value: "List" },
        { label: t("product.units.box"), value: "Box" },
        { label: t("product.units.pack"), value: "Pack" },
        { label: t("product.units.set"), value: "Set" },
        { label: t("product.units.dozen"), value: "Dozen" },
        { label: t("product.units.notSpecified"), value: "NotSpecified" }

      ]);

      setProductTypes([
        { label: t("product.productTypes.service"), value: "Service" },
        { label: t("product.productTypes.product"), value: "Product" },
        { label: t("product.productTypes.rental"), value: "Rental" },
      ]);
    };

    fetchData();
  }, [t]); // Add t as dependency to refresh translations when language changes

  // Note: Avoid using effects as event handlers for productType changes.

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
          setImage(URL.createObjectURL(file));
        }
      };

      input.click();
      document.body.removeChild(input);
    } else {
      // Native platform logic
      const currentPermission =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      const hasPhotoAccess =
        currentPermission.granted ||
        currentPermission.accessPrivileges === "limited";

      const requestedPermission = hasPhotoAccess
        ? currentPermission
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      const canUsePicker =
        requestedPermission.granted ||
        requestedPermission.accessPrivileges === "limited";

      if (!canUsePicker) {
        setAlertConfig({
          visible: true,
          title: t("product.avatar.permission"),
          message: t("product.avatar.permissionDenied"),
          buttons: [
            {
              text: t("common.ok"),
              onPress: () => setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        selectionLimit: 1,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
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
    if (isCreating) return;
    setError("");

    const normalizedProductType = (productType || "").toLowerCase();
    const requiresStock = normalizedProductType === "product";

    const missingBaseFields = [name, description, price].some((value) =>
      isFieldEmpty(value)
    );
    const missingStock = requiresStock && isFieldEmpty(stock);

    if (missingBaseFields || missingStock) {
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
      setIsCreating(true);
      const formData = new FormData();

      if (image) {
        if (Platform.OS === "web") {
          // Convert data URL to blob for web
          const response = await fetch(image);
          const blob = await response.blob();
          formData.append("image", blob);
        } else {
          // For native platforms
          formData.append("image", {
            uri: image,
            name: "image.jpg",
            type: "image/jpeg",
          } as unknown as Blob);
        }
      }

      const trimmedName = name.trim();
      const trimmedDescription = description.trim();
      const trimmedBarcode = barcode.trim();
      const trimmedStock = stock.trim();
      const trimmedPrice = price.trim();
      const trimmedUnit = unit ? unit.trim() : "";
      const resolvedProductType =
        normalizedProductType === "service"
          ? "Service"
          : normalizedProductType === "product"
          ? "Product"
          : normalizedProductType === "rental"
          ? "Rental"
          : productType;

      formData.append("name", trimmedName);
      formData.append("description", trimmedDescription);
      formData.append("barcode", trimmedBarcode);
      formData.append("stock", trimmedStock.length > 0 ? trimmedStock : "0");
      formData.append("price", trimmedPrice.length > 0 ? trimmedPrice : "0");
      formData.append("memberId", (await getMemberId()) || "");

      // Add the new unit and productType fields to the formData
      if (trimmedUnit) formData.append("unit", trimmedUnit);
      if (resolvedProductType) formData.append("productType", resolvedProductType);

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
              router.replace("/product");
            },
          },
        ],
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View
      className={`flex-1 ${useBackgroundColorClass()}`}
      style={{
        alignItems: Platform.OS === "web" ? "center" : "stretch",
      }}
    >
      <ScrollView>
        <View className="flex-1 justify-center h-full px-4 py-5 pb-20">
          {image && (
            <Image
              source={{ uri: image }}
              style={{ width: 350, height: 350 }}
              className="mt-4 mb-6 self-center rounded-md"
            />
          )}

          {/* Product Type dropdown moved before product name */}
          <Dropdown2
            title={t("product.type")}
            options={productTypes}
            selectedValue={
              productType
                ? productTypes.find((t) => t.value === productType)?.label
                : ""
            }
            onValueChange={(value: string) => {
              setProductType(value);
              if (value === "Service" || value === "Rental") {
                // Batch dependent updates when switching to Service or Rental
                setbarcode("");
                setstock("1");
              }
            }}
            placeholder={t("product.selectType")}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            bgChoiceColor={theme === "dark" ? "#3D3D3D" : "#f1f1f1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles="mt-0 mb-2"
          />

          <View className="flex flex-row justify-between">
            <View className="w-1/2 pr-2">
              <FormField2
                title={productType !== "Service" ? t("product.productName") : t("product.serviceName")}
                value={name}
                handleChangeText={setproductname}
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles}
              />
            </View>
            <View className="w-1/2 pl-2">
              {/* Unit dropdown moved beside product name */}
              <Dropdown2
                title={t("product.unitTitle")}
                options={units}
                selectedValue={
                  unit ? units.find((u) => u.value === unit)?.label : ""
                }
                onValueChange={(value: string) => setUnit(value)}
                placeholder={t("product.selectUnit")}
                bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                bgChoiceColor={theme === "dark" ? "#3D3D3D" : "#f1f1f1"}
                textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                otherStyles={fieldStyles }
              />
            </View>
          </View>

          {/* Barcode field is conditionally rendered based on product type */}
          {productType !== "Service" && productType !== "Rental" && (
            <FormField2
              title={t("product.barcode")}
              value={barcode}
              handleChangeText={setbarcode}
              otherStyles={fieldStyles}
              bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
              textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
              keyboardType="number-pad"
            />
          )}

          <FormField2
            title={t("product.description")}
            value={description}
            handleChangeText={setdescription}
            bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
            textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
            otherStyles={fieldStyles}
          />

          <View className="flex flex-row justify-between">
            {productType !== "Service" && (
              <View className="w-1/2 pr-2">
                <FormField2
                  title={t("product.stock")}
                  value={stock}
                  handleChangeText={setstock}
                  otherStyles={fieldStyles}
                  bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                  textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                  keyboardType="number-pad"
                  editable={productType !== "Rental"}
                />
              </View>
            )}
            <View className={productType === "Service" ? "w-full" : "w-1/2 pl-2"}>
              <FormField2
                title={t("product.price")}
                subtitle={vat ? t("product.priceSubtitle") : undefined}
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
            isLoading={isCreating}
          />
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
