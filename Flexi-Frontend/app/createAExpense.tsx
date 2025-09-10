import {
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { View } from "@/components/Themed";
import { SecondaryButton } from "@/components/CustomButton";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomAlert from "@/components/CustomAlert";
import { CustomText } from "@/components/CustomText";
import { FloatingLabelInput } from "@/components/FloatingLabelInput";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import CallAPIExpense from "@/api/expense_api";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { getMemberId } from "@/utils/utility";
import { format } from "date-fns";
import i18n from "@/i18n";
import { useBusiness } from "@/providers/BusinessProvider";

// Format date in DD/MM/YYYY H:MM AM/PM format
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const parsedDate = new Date(dateString);
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();

  // Get hours in 12-hour format
  let hours = parsedDate.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Get minutes
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

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
  const [SelectedDates, setSelectedDates] = useState<string[]>([
    new Date().toISOString(),
  ]);
  const { vat, DocumentType } = useBusiness();
  const [vatIncluded, setVatIncluded] = useState(false);
  const [vatAmount, setVatAmount] = useState(0);
  const [withHoldingTax, setWithHoldingTax] = useState(false);
  const [WHTpercent, setWHTpercent] = useState(3);
  const [WHTAmount, setWHTAmount] = useState(0);
  const [sName, setSName] = useState<string>("");
  const [sTaxId, setSTaxId] = useState<string>("");
  const [taxInvoiceNo, setTaxInvoiceNo] = useState<string>("");
  const [sAddress, setSAddress] = useState<string>("");
  const [taxType, setTaxType] = useState<"Individual" | "Juristic">(
    "Individual"
  );
  const [branch, setBranch] = useState<string>("headOffice");

  // Reset VAT and WHT when Fuel group is selected
  useEffect(() => {
    if (group === "Fuel") {
      setVatIncluded(false);
      setWithHoldingTax(false);
      setWHTpercent(3);
      setVatAmount(0);
      setWHTAmount(0);
    }
  }, [group]);

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
  };

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
    setVatIncluded(false);
    setWithHoldingTax(false);
    setWHTpercent(3);
    setSName("");
    setSTaxId("");
    setTaxInvoiceNo("");
    setSAddress("");
    setBranch("");
    setTaxType("Individual");
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
        message: t("expense.create.message"),
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
      const memberId = await getMemberId();
      const formattedDate = format(
        new Date(date[0]),
        "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
      );

      const formData = new FormData();
      formData.append("date", formattedDate);
      formData.append("note", note);
      formData.append("amount", amount);
      formData.append("desc", desc);
      if (image) {
        formData.append("image", {
          uri: image,
          name: "image.jpg",
          type: "image/jpeg",
        } as unknown as Blob);
      }
      formData.append("group", group || "");
      formData.append("vat", vatIncluded ? "true" : "false");
      formData.append("withHoldingTax", withHoldingTax ? "true" : "false");
      formData.append("WHTpercent", WHTpercent.toString());
      formData.append("sTaxId", sTaxId);
      formData.append("sName", sName);
      formData.append("taxInvoiceNo", taxInvoiceNo);
      formData.append("sAddress", sAddress);
      formData.append("branch", branch);
      formData.append("taxType", taxType);
      if (memberId) {
        formData.append("memberId", memberId);
      } else {
        throw new Error("Member ID is null or undefined");
      }

      const data = await CallAPIExpense.createAExpenseAPI(formData);
      if (data.error) throw new Error(data.error);

      // Set vatAmount from backend response if available
      if (data.vatAmount !== undefined) {
        setVatAmount(data.vatAmount);
      }

      // Set vatAmount from backend response if available
      if (data.vatAmount !== undefined) {
        setVatAmount(data.vatAmount);
      }
      // Set WHTAmount from backend response if available
      if (data.WHTAmount !== undefined) {
        setWHTAmount(data.WHTAmount);
      }
      clearForm();
      onClose();
      success();
    } catch (error: any) {
      setError(error.message);
    }
  };
  // Setting Button Group of Expense
  const groupButtonClass = (groupName: string) =>
    `px-4 py-2 rounded-lg mx-1 border-2 ${
      group === groupName
        ? theme === "dark"
          ? "bg-zinc-800 border-secondary"
          : "bg-zinc-200 border-secondary"
        : theme === "dark"
        ? "bg-zinc-800 border-transparent"
        : "bg-zinc-200 border-transparent"
    }`;

  const handleDatesChange = (dates: string[]) => {
    setSelectedDates(dates);
    console.log("Selected Dates:", dates);
    setDate(dates); // Store the dates as an array
    setCalendarVisible(false);
  }; // force to chose only one date

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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
            style={{
              width: Platform.OS === "web" ? "50%" : "100%",
              alignSelf: "center",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                flex:
                  Platform.OS === "web"
                    ? image
                      ? 0.8
                      : 0.4
                    : image
                    ? 0.2
                    : 0.1,
                justifyContent: "center",
                width: "100%",
                backgroundColor: theme === "dark" ? "#2D2D2D" : "#ffffff",
                borderRadius: 10,
                padding: Platform.OS === "web" ? 20 : 0,
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
                      ? formatDate(SelectedDates[0])
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
                  style={{
                    fontFamily:
                      i18n.language === "th"
                        ? "IBMPlexSansThai-Medium"
                        : "Poppins-Regular",
                    textAlign: "center",
                    fontSize: 16,
                    color: theme === "dark" ? "#818181" : "#68655f",
                  }}
                  value={desc}
                  onChangeText={setDesc}
                  placeholder={t("expense.detail.description")}
                  placeholderTextColor={
                    theme === "dark" ? "#6d6c67" : "#adaaa6"
                  }
                />

                <TextInput
                  className={`text-center text-2xl font-bold py-3 ${
                    theme === "dark" ? "text-secondary-100" : "text-secondary"
                  }`}
                  value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChangeText={(val) => {
                    const raw = val.replace(/,/g, "");
                    setAmount(raw);
                    setWHTAmount(raw ? (Number(raw) * WHTpercent) / 100 : 0);
                  }}
                  placeholder="0.00"
                  placeholderTextColor={
                    theme === "dark" ? "#6d6c67" : "#adaaa6"
                  }
                  keyboardType="numeric"
                />

                {vat && vatIncluded && (
                  <View
                    style={{
                      marginTop: 8,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "flex-start",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      <CustomText style={{ textAlign: "right" }}>
                        {t("expense.detail.exclVat") + " :"}
                      </CustomText>
                      <CustomText style={{ textAlign: "right" }}>
                        {t("expense.detail.vat") + " :"}
                      </CustomText>
                    </View>
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-end",
                        marginLeft: 12,
                      }}
                    >
                      <CustomText style={{ textAlign: "left" }}>
                        {(Number(amount) / 1.07)
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </CustomText>
                      <CustomText style={{ textAlign: "left" }}>
                        {(Number(amount) * 0.07)
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      </CustomText>
                    </View>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginTop: 8,
                  }}
                >
                  {vat && (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 24,
                        opacity: group === "Fuel" ? 0.5 : 1,
                      }}
                      onPress={() => {
                        if (group !== "Fuel") {
                          setVatIncluded(!vatIncluded);
                        }
                      }}
                      disabled={group === "Fuel"}
                    >
                      <Ionicons
                        name={vatIncluded ? "checkbox" : "square-outline"}
                        size={22}
                        color={theme === "dark" ? "#d0d0d0" : "#c1c1c1"}
                      />
                      <CustomText className="ml-2">
                        {t("expense.detail.vatIncluded")}
                      </CustomText>
                    </TouchableOpacity>
                  )}
                  {DocumentType && DocumentType.includes("WithholdingTax") && (
                    <>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 8,
                          opacity: group === "Fuel" ? 0.5 : 1,
                        }}
                        onPress={() => {
                          if (group !== "Fuel") {
                            setWithHoldingTax(!withHoldingTax);
                          }
                        }}
                        disabled={group === "Fuel"}
                      >
                        <Ionicons
                          name={withHoldingTax ? "checkbox" : "square-outline"}
                          size={22}
                          color={theme === "dark" ? "#d0d0d0" : "#c1c1c1"}
                        />
                        <CustomText
                          style={{ textAlign: "right", marginLeft: 8 }}
                        >
                          {t("expense.detail.withHoldingTax")}
                        </CustomText>
                      </TouchableOpacity>
                      {withHoldingTax && (
                        <>
                          <TextInput
                            style={{
                              width: 60,
                              borderWidth: 1,
                              borderColor: theme === "dark" ? "#444" : "#ccc",
                              borderRadius: 8,
                              padding: 4,
                              color: theme === "dark" ? "#fff" : "#000",
                              textAlign: "center",
                              opacity: group === "Fuel" ? 0.5 : 1,
                            }}
                            value={WHTpercent.toString()}
                            onChangeText={(val) => {
                              if (group !== "Fuel") {
                                const num = parseFloat(val);
                                setWHTpercent(isNaN(num) ? 0 : num);
                                setWHTAmount(
                                  Number(amount)
                                    ? (Number(amount) *
                                        (isNaN(num) ? 0 : num)) /
                                        100
                                    : 0
                                );
                              }
                            }}
                            placeholder={t("expense.detail.percent")}
                            keyboardType="numeric"
                            editable={group !== "Fuel"}
                          />
                          <CustomText style={{ marginLeft: 4 }}>%</CustomText>
                        </>
                      )}
                    </>
                  )}
                </View>
                <FloatingLabelInput
                  label={t("expense.detail.note")}
                  value={note}
                  onChangeText={setNote}
                />

                {(vatIncluded || withHoldingTax) && (
                  <>
                    <FloatingLabelInput
                      label={t("expense.detail.sName")}
                      value={sName}
                      onChangeText={setSName}
                    />
                    {/* Tax Type Checkboxes Row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        marginTop: 8,
                        marginBottom: 8,
                        backgroundColor: "transparent",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 24,
                        }}
                        onPress={() => {
                          setTaxType("Individual");
                          setBranch("");
                        }}
                      >
                        <Ionicons
                          name={
                            taxType === "Individual"
                              ? "checkbox"
                              : "square-outline"
                          }
                          size={22}
                          color={theme === "dark" ? "#d0d0d0" : "#c1c1c1"}
                        />
                        <CustomText className="ml-2">
                          {t("auth.businessRegister.taxTypeOption.Individual")}
                        </CustomText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 8,
                        }}
                        onPress={() => {
                          setTaxType("Juristic");
                          setBranch("headOffice");
                        }}
                      >
                        <Ionicons
                          name={
                            taxType === "Juristic"
                              ? "checkbox"
                              : "square-outline"
                          }
                          size={22}
                          color={theme === "dark" ? "#d0d0d0" : "#c1c1c1"}
                        />
                        <CustomText className="ml-2">
                          {t("auth.businessRegister.taxTypeOption.Juristic")}
                        </CustomText>
                      </TouchableOpacity>
                      {taxType === "Juristic" && (
                        <>
                          <TextInput
                            style={{
                              width: 90,
                              borderWidth: 1,
                              borderColor: theme === "dark" ? "#444" : "#ccc",
                              borderRadius: 8,
                              padding: 4,
                              color: theme === "dark" ? "#fff" : "#000",
                              textAlign: "center",
                              marginLeft: 8,
                              fontFamily:
                                i18n.language === "th"
                                  ? "IBMPlexSansThai-Medium"
                                  : "Poppins-Regular",
                              fontSize: 11,
                            }}
                            value={
                              branch === "headOffice"
                                ? t("expense.detail.headOffice")
                                : branch
                            }
                            onChangeText={(text) => {
                              // If user clears the field or types something different, store the raw text
                              if (text === t("expense.detail.headOffice")) {
                                setBranch("headOffice");
                              } else {
                                setBranch(text);
                              }
                            }}
                            placeholder={t("expense.detail.branch")}
                          />
                        </>
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        marginTop: 8,
                        marginBottom: 8,
                        marginHorizontal: 0,
                      }}
                    >
                      <FloatingLabelInput
                        label={t("expense.detail.sTaxId")}
                        value={sTaxId}
                        onChangeText={setSTaxId}
                        containerStyle={{ flex: 1, marginVertical: 0 }}
                      />
                      <FloatingLabelInput
                        label={t("expense.detail.taxInvoiceNo")}
                        value={taxInvoiceNo}
                        onChangeText={setTaxInvoiceNo}
                        containerStyle={{ flex: 1, marginVertical: 0 }}
                      />
                    </View>
                    <FloatingLabelInput
                      label={t("expense.detail.sAddress")}
                      value={sAddress}
                      onChangeText={setSAddress}
                    />
                  </>
                )}
                <View className="flex-row justify-evenly items-center">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row m-1 "
                  >
                    {[
                      {
                        key: "Employee",
                        label: t("expense.detail.group.employee"),
                      },
                      {
                        key: "Freelancer",
                        label: t("expense.detail.group.freelancer"),
                      },
                      {
                        key: "Office",
                        label: t("expense.detail.group.office"),
                      },
                      {
                        key: "OfficeRental",
                        label: t("expense.detail.group.officeRental"),
                      },
                      {
                        key: "CarRental",
                        label: t("expense.detail.group.carRental"),
                      },
                      {
                        key: "Commission",
                        label: t("expense.detail.group.commission"),
                      },
                      {
                        key: "Advertising",
                        label: t("expense.detail.group.advertising"),
                      },
                      {
                        key: "Marketing",
                        label: t("expense.detail.group.marketing"),
                      },
                      {
                        key: "Copyright",
                        label: t("expense.detail.group.copyright"),
                      },
                      {
                        key: "Dividend",
                        label: t("expense.detail.group.dividend"),
                      },
                      {
                        key: "Interest",
                        label: t("expense.detail.group.interest"),
                      },
                      {
                        key: "Influencer",
                        label: t("expense.detail.group.influencer"),
                      },
                      {
                        key: "Accounting",
                        label: t("expense.detail.group.accounting"),
                      },
                      { key: "Legal", label: t("expense.detail.group.legal") },
                      {
                        key: "Taxation",
                        label: t("expense.detail.group.taxation"),
                      },
                      {
                        key: "Transport",
                        label: t("expense.detail.group.transport"),
                      },
                      {
                        key: "Product",
                        label: t("expense.detail.group.product"),
                      },
                      {
                        key: "Packing",
                        label: t("expense.detail.group.packing"),
                      },
                      {
                        key: "Fuel",
                        label: t("expense.detail.group.fuel"),
                      },
                      {
                        key: "Utilities",
                        label: t("expense.detail.group.utility"),
                      },
                      { key: "Others", label: t("expense.detail.group.other") },
                    ].map(({ key, label }) => (
                      <TouchableOpacity
                        key={key}
                        onPress={() => setGroup(key)}
                        className={groupButtonClass(key)}
                      >
                        <CustomText>{label}</CustomText>
                      </TouchableOpacity>
                    ))}
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

                  <SecondaryButton
                    title={t("common.save")}
                    handlePress={handleCreateExpense}
                    containerStyles="px-12 mt-2"
                    textStyles="!text-white"
                  />
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

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
              <MultiDateCalendar onDatesChange={handleDatesChange} />
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
