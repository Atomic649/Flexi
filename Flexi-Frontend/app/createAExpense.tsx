import {
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Text,
  TextInput,
} from "react-native";
import { View } from "@/components/Themed";
import CustomButton from "@/components/CustomButton";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIExpense from "@/api/expense_api";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { getMemberId } from "@/utils/utility";
import { format } from "date-fns";
import { th } from "date-fns/locale"; // Import Thai locale if needed

interface ExpenseDetailProps {
  visible: boolean;
  onClose: () => void;
  success: () => void;
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

export default function CreateExpense({
  success,
  visible,  
  onClose,
}: ExpenseDetailProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();  
  const [note, setNote] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [image, setImage] = useState<string | undefined>();
  const [group, setGroup] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [date, setDate] = useState<string[]>([new Date().toISOString()]);
  const [SelectedDates, setSelectedDates] = useState<string[]>([new Date().toISOString()]);
  

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

  const clearForm = () => {
    setNote("");
    setAmount("");
    setDesc("");
    setImage(undefined);
    setGroup(undefined);
    setDate([new Date().toISOString()]);
    setSelectedDates([new Date().toISOString()]);
    setError("");
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  const handleCreateExpense = async () => {
    setError("");

    // Check if all fields are filled
    if (!date || !note || !amount) {
      setAlertConfig({
        visible: true,
        title: t("expense.create.error"),
        message: t("expense.create.error.message"),
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
    // convert date to string

    const memberId = await getMemberId(); // Assuming getMemberId is a function that fetches the memberId

    const formattedDate = format(new Date(date[0]), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    const Expense = {
      date: formattedDate, // Use the formatted date
      note,
      amount: Number(amount),
      desc,
      image,
      group,
      memberId,
      
    };

      const data = await CallAPIExpense.createAExpenseAPI(Expense);
      if (data.error) throw new Error(data.error);

      clearForm();
      onClose();
      success();
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

  const handleDatesChange =  (dates: string[]) => {
    setSelectedDates(dates);
    console.log("Selected Dates:", dates);
    setDate(dates); // Store the dates as an array
    setCalendarVisible(false);
  };  // force to chose only one date
  

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#000000aa" : "#bfbfbfaa",
        }}
        activeOpacity={1}
        onPressOut={handleClose}
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

              <View className="flex-row items-center justify-center bg-transparent  rounded-full p-2 ml-2">
                <CustomText
                  className={`text-base mx-2 ${
                    theme === "dark" ? "text-[#c9c9c9]" : "text-[#48453e]"
                  }`}
                >
                  {SelectedDates.length > 0
                    ? format(new Date(SelectedDates[0]), "dd-MM-yyyy HH:mm", { locale: th })
                    : t("dashboard.selectDate")}
                </CustomText>
                {/* icon Calendar */}
                <Ionicons
                  name="calendar"
                  size={24}
                  color={theme === "dark" ? "#ffffff" : "#444541"}
                  onPress={() => setCalendarVisible(true)}
                />
              </View>
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
                  : "bg-white border-zinc-300"
                }`}
                style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
                value={note}
                onChangeText={setNote}
                placeholder={t("expense.detail.note")}
                placeholderTextColor={theme === "dark" ? "#504f4d" : "#c0beb5"}
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

              {error ? (
                <View className="items-center">
                  <Text className="text-secondary mt-3">{error}</Text>
                </View>
                ) : null}

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


                <CustomButton
                  title={t("common.save")}
                  handlePress={handleCreateExpense}
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

        {/* Modal for MultiDateCalendar */}
        <Modal
          visible={calendarVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setCalendarVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setCalendarVisible(false)}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme === "dark" ? "#000000b5" : "#b4cac6a9",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
                padding: 16,
                borderRadius: 16,
              }}
            >
              <MultiDateCalendar onDatesChange={handleDatesChange}  />
            </TouchableOpacity>
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
