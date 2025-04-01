import {
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Text,
  TextInput,
} from "react-native";
import { View } from "@/components/Themed";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIExpense from "@/api/expense_api";

interface ExpenseDetailProps {
  visible: boolean;
  onClose: () => void;
  expense: {
    date: string;
    note: string;
    desc: string;
    amount: string;
    image: string;
    id: number;
    group: string;
  };
}

export default function ExpenseDetail({
  visible,
  onClose,
  expense,
}: ExpenseDetailProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [date, setDate] = useState(expense.date);
  const [note, setNote] = useState(expense.note);
  const [desc, setDesc] = useState(expense.desc);
  const [amount, setAmount] = useState(expense.amount);
  const [image, setImage] = useState(expense.image);
  const [group, setGroup] = useState(expense.group);
  const [error, setError] = useState("");
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        console.log("Fetching expense with ID:", expense.id); // Add logging
        const fetchedExpense = await CallAPIExpense.getExpenseByIdAPI(
          expense.id
        ); // Use the id from the expense object
        console.log("Fetched expense:", fetchedExpense); // Add logging
        setDate(fetchedExpense.date);
        setNote(fetchedExpense.note);
        setDesc(fetchedExpense.desc);
        setAmount(fetchedExpense.amount);
        setImage(fetchedExpense.image);
        setGroup(fetchedExpense.group);
      } catch (error) {
        console.error("Error fetching expense:", error);
      }
    };

    fetchExpense();
  }, [expense.id]); // Use the id from the expense object

  const pickImage = async (allowsEditing = false) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
 
 }

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

  // Handle update
  const handleUpdateExpense = async () => {
    setError("");

    // Check if all fields are filled
    if (!date || !note|| !amount) {
      setAlertConfig({
        visible: true,
        title: t("expense.updated"),
        message: t("expense.updated.message"),
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
      const updatedExpense = {
        date,
        note,
        desc,
        amount: Number(amount),
        image,
        group,
      };

      const data = await CallAPIExpense.updateExpenseAPI(
        expense.id,
        updatedExpense
      );
      onClose();

      if (data.error) throw new Error(data.error);
    } catch (error: any) {
      setError(error.message);
    }
  };
  // Setting Button Group of Expense
  const groupButtonClass = (groupName: string) =>
    `px-4 py-2 rounded-lg mx-1 ${
      group === groupName
        ? theme === "dark"
          ? "bg-zinc-500"
          : "bg-secondary"
        : theme === "dark"
        ? "bg-zinc-800"
        : "bg-zinc-200"
    }`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#000000aa" : "#bfbfbfaa",
        }}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          style={{ width: "100%" }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              justifyContent: "center",
              width: "90%",
              backgroundColor: theme === "dark" ? "#2D2D2D" : "#ffffff",
              borderRadius: 10,
            }}
            onPress={() => {}}
          >
            <View className=" flex-1 justify-center h-full py-6 px-4 rounded-lg">
              <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                {image && (
                  <Image
                    source={{ uri: image }}
                    style={{ width: 300, height: 300 }}
                    className="mt-4 mb-6 self-center rounded-md"
                  />
                )}
              </TouchableOpacity>
              <CustomText className="text-center font-bold">
                {date
                  ? date.replace("T", "  ").replace(/:\d{2}\.\d{3}Z$/, "")
                  : ""}
              </CustomText>
             
                <TextInput
                className="text-center text-base"
                value={desc}
                onChangeText={setDesc}
                placeholder={t("expense.detail.description")}
                placeholderTextColor={theme === "dark" ? "#6d6c67" : "#adaaa6"}
                />
                <TextInput
                className={`text-center text-2xl font-bold py-3 ${
                  theme === "dark" ? "text-secondary-100" : "text-secondary"
                }`}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={theme === "dark" ? "#6d6c67" : "#adaaa6"}
                keyboardType="numeric"
                />
                <TextInput
                className={`mt-3 mb-2 mx-1 h-14  px-4 rounded-2xl border-2 focus:border-secondary ${
                  theme === "dark"
                  ? "bg-primary-100 border-black-200"
                  : "bg-white border-gray-100"
                }`}
                style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
                value={note}
                onChangeText={setNote}
                placeholder={t("expense.detail.note")}
                />
                <View className="flex-row justify-evenly items-center">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row m-1 "
                >
                  <TouchableOpacity
                  onPress={() => setGroup("Marketing")}
                  className={groupButtonClass("Marketing")}
                  >
                  <CustomText>{t("expense.detail.group.marketing")}</CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => setGroup("Transport")}
                  className={groupButtonClass("Transport")}
                  >
                  <CustomText>{t("expense.detail.group.transport")}</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                  onPress={() => setGroup("Taxation")}
                  className={groupButtonClass("Taxation")}
                  >
                  <CustomText>{t("expense.detail.group.taxation")}</CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => setGroup("Office")}
                  className={groupButtonClass("Office")}
                  >
                  <CustomText>{t("expense.detail.group.office")}</CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => setGroup("Employee")}
                  className={groupButtonClass("Employee")}
                  >
                  <CustomText>{t("expense.detail.group.employee")}</CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => setGroup("Product")}
                  className={groupButtonClass("Product")}
                  >
                  <CustomText>{t("expense.detail.group.product")}</CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => setGroup("Packing")}
                  className={groupButtonClass("Packing")}
                  >
                  <CustomText>{t("expense.detail.group.packing")}</CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => setGroup("Utilities")}
                  className={groupButtonClass("Utilities")}
                  >
                  <CustomText>{t("expense.detail.group.utility")}</CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => setGroup("Account")}
                  className={groupButtonClass("Account")}
                  >
                  <CustomText>{t("expense.detail.group.account")}</CustomText>
                  </TouchableOpacity>

                  <TouchableOpacity
                  onPress={() => setGroup("Others")}
                  className={groupButtonClass("Others")}
                  >
                  <CustomText>{t("expense.detail.group.other")}</CustomText>
                  </TouchableOpacity>
                </ScrollView>
                </View>
                <View className="flex-row justify-evenly">
                <TouchableOpacity
                  onPress={() => pickImage()}
                  className=" items-center justify-center"
                >
                  <Ionicons
                  name="document-text-outline"
                  size={26}
                  color="#999999"
                  />
                  <CustomText className="text-center mt-1">
                    {t("expense.detail.attachBill")}
                  </CustomText>
                </TouchableOpacity>

                {error ? (
                  <CustomText className="text-red-500 mt-4">{error}</CustomText>
                ) : null}

                <CustomButton
                  title={t("common.save")}
                  handlePress={handleUpdateExpense}
                  containerStyles="px-12 mt-2"
                  textStyles="!text-white"
                />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>

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
                  uri: image,
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

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() =>
            setAlertConfig((prev) => ({ ...prev, visible: false }))
          }
        />
      </TouchableOpacity>
    </Modal>
  );
}
