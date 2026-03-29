import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "@/components/CustomText";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import FormField2 from "@/components/formfield/FormField2";
import Dropdown2 from "@/components/dropdown/Dropdown2";
import { CustomButton } from "@/components/CustomButton";
import CustomAlert from "@/components/CustomAlert";
import CallAPIPrint from "@/api/print_api";
import { getMemberId, getBusinessId } from "@/utils/utility";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { getResponsiveStyles, isMobile, isTablet } from "@/utils/responsive";
import * as Sharing from "expo-sharing";
import * as ExpoPrint from "expo-print";
import { useBusiness } from "@/providers/BusinessProvider";
import CallAPIBusiness from "@/api/business_api";
import { generateMonthlyReportHTML } from "@/components/PDFTemplates/MonthlySaleReportTemplate";
import { generateExpenseReportHTML } from "@/components/PDFTemplates/MonthlyExpenseReportTemplate";
import { generateInvoiceHTML } from "@/components/PDFTemplates/InvoiceTemplate";
import { generateQuotationHTML } from "@/components/PDFTemplates/QuotationTemplate";
import { generateInvoiceHTML as generateReceiptHTML } from "@/components/PDFTemplates/ReceiptTemplate";
import { vatRate } from "@/components/TaxVariable";
import { useLocalSearchParams } from "expo-router";
import InvoiceDetailsModal from "@/components/print/InvoiceDetailsModal";

// Constants for search types and tab indices
const SEARCH_TYPES = {
  CUSTOMER_NAME: "customerName",
  CUSTOMER_PHONE: "customerPhone",
  BILL_ID: "billId",
  QUOTATION_ID: "quotationId",
  INVOICE_ID: "invoiceId",
  DATE_RANGE: "dateRange",
};

const TAB_INDICES = {
  MONTHLY_REPORT: 0,
  INDIVIDUAL_INVOICE: 1,
};

// Format date in DD/MM/YYYY format
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const parsedDate = new Date(dateString);
  return format(parsedDate, "dd/MM/yyyy");
};

// Helper function to get translated month name
const getTranslatedMonth = (date: Date, t: any) => {
  const month = date.getMonth();
  const monthKeys = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  return t(`months.${monthKeys[month]}`);
};

// Helper function to format month year with translation
const formatMonthYear = (date: Date, t: any) => {
  const translatedMonth = getTranslatedMonth(date, t);
  const year = date.getFullYear();
  return `${translatedMonth} ${year}`;
};

// Helper function to calculate total from sum total
const calculateInvoiceTotal = (invoice: any) => {
  // Check if invoice is null or undefined
  if (!invoice) {
    return 0;
  }
  const total = Number(invoice.total);
  return total;
};

export default function Print() {
  const params = useLocalSearchParams<{ billId?: string }>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    businessName,
    vat,
    DocumentType: contextDocumentTypes,
  } = useBusiness();
  const [activeTab, setActiveTab] = useState(TAB_INDICES.INDIVIDUAL_INVOICE);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState(SEARCH_TYPES.CUSTOMER_NAME);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [dateRange, setDateRange] = useState<string[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for component remount
  const [monthlyTotals, setMonthlyTotals] = useState({
    totalSales: 0,
    totalUnpaidSales: 0,
    totalOrders: 0,
    paidOrders: 0,
    unpaidOrders: 0,
    averageOrderValue: 0,
    totalExpenses: 0,
    totalExpenseCount: 0,
    vatExpenses: 0,
    whtExpenses: 0,
    averageExpenseAmount: 0,
    expensesByGroup: {} as { [key: string]: number },
    // Summary fields from API
    accountReceivable: 0,
    adsSpend: 0,
    amount: "0/0",
  });

  // Add expenses state
  const [expenses, setExpenses] = useState<any[]>([]);

  // Check business is Vat registered (use BusinessProvider vat value)
  const isVatRegistered = vat === true;

  

  const totalVat =
    (calculateInvoiceTotal(selectedInvoice) * vatRate) / (100 + vatRate);

  // Format currency with translation
  const formatCurrency = (amount: number) => {
    // Original formatting that causes encoding issues: return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
    // Instead format without currency symbol and add THB manually using translation
    return (
      new Intl.NumberFormat("th-TH", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) +
      " " +
      t("common.THB")
    );
  };

  // Format currency specifically for PDF with translation to avoid Thai Baht symbol encoding issues
  const formatCurrencyForPDF = (amount: number) => {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) +
      " " +
      t("common.THB")
    );
  };

  // Print progression state - start with first available type
  const [selectedPrintType, setSelectedPrintType] = useState<
    "QA" | "IV" | "RE"
  >("QA");

  // Helper functions for Print progression UI
  const getPrintStepOrder = (step: "QA" | "IV" | "RE"): number => {
    const order = { QA: 1, IV: 2, RE: 3 };
    return order[step];
  };

  const isPrintStepCompleted = (step: "QA" | "IV" | "RE"): boolean => {
    return getPrintStepOrder(selectedPrintType) >= getPrintStepOrder(step);
  };

  const getPrintStepOpacity = (step: "QA" | "IV" | "RE"): number => {
    if (isPrintStepCompleted(step)) return 1;
    return 0.4;
  };

  const getPrintStepIconColor = (step: "QA" | "IV" | "RE"): string => {
    if (isPrintStepCompleted(step))
      return theme === "dark" ? "#18181b" : "#ffffff";
    return theme === "dark" ? "#666" : "#999";
  };

  const getPrintStepDescriptionColor = (step: "QA" | "IV" | "RE"): string => {
    if (isPrintStepCompleted(step))
      return theme === "dark" ? "#c9c9c9" : "#666";
    return theme === "dark" ? "#555" : "#bbb";
  };

  const getPrintStepBackgroundColor = (step: "QA" | "IV" | "RE"): string => {
    if (isPrintStepCompleted(step)) return "#04ecc1";
    return "transparent";
  };

  const getPrintStepBorderColor = (step: "QA" | "IV" | "RE"): string => {
    if (isPrintStepCompleted(step)) return "#04ecc1";
    return theme === "dark" ? "#666" : "#ccc";
  };

  // Helper functions to check document type availability
  const isDocumentTypeAvailable = (type: string): boolean => {
    if (!contextDocumentTypes) return false;
    const docTypes = Array.isArray(contextDocumentTypes)
      ? contextDocumentTypes
      : [contextDocumentTypes];
    return docTypes.includes(type);
  };

  const getAvailablePrintSteps = (): ("QA" | "IV" | "RE")[] => {
    const steps: ("QA" | "IV" | "RE")[] = [];
    if (isDocumentTypeAvailable("Quotation")) steps.push("QA");
    if (isDocumentTypeAvailable("Invoice")) steps.push("IV");
    if (isDocumentTypeAvailable("Receipt")) steps.push("RE");
    return steps;
  };

  const printRef = useRef<any>(null);

  // Alert state
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

  // PDF preview state
  const [pdfPreviewUri, setPdfPreviewUri] = useState<string | null>(null);
  const [pdfPreviewModalVisible, setPdfPreviewModalVisible] = useState(false);

  // Fetch business details directly when memberId is known (avoid effect as event handler)
  const fetchBusinessDetailsByMemberId = async (mid: string) => {
    try {
      const response = await CallAPIBusiness.getBusinessDetailsAPI(mid);
      setBusinessDetails(response);
      console.log("Business Details :", response);
    } catch (error) {
      console.error("Error fetching business details:", error);
    }
  };

  // Fetch user credentials on component mount
  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const member = await getMemberId();
        const business = await getBusinessId();

        setMemberId(member);
        setBusinessId(business);

        // Fetch monthly report data initially
        if (member) {
          fetchMonthlyReportData(selectedMonth);
          // Also fetch the business details now that we have memberId
          await fetchBusinessDetailsByMemberId(member);
        }
      } catch (error) {
        console.error("Error fetching credentials:", error);
      }
    };

    fetchCredentials();
  }, []);
  // Note: No effect reacting to memberId; business details are fetched when credentials are loaded

  // If navigated with billId param, fetch that invoice and open modal automatically
  useEffect(() => {
    const openInvoiceFromParams = async () => {
      try {
        if (!params?.billId || !memberId) return;
        // Reuse existing search API by bill id
        const response = await CallAPIPrint.searchBillByIdAPI(
          memberId,
          String(params.billId),
        );
        if (response) {
          viewInvoiceDetails(response);
        }
      } catch (error) {
        console.error("Error opening invoice from params:", error);
      }
    };
    openInvoiceFromParams();
    // Re-run when billId or memberId becomes available
  }, [params?.billId, memberId]);

  // Helper: map document type to step
  const mapDocTypeToStep = (docType: string): "QA" | "IV" | "RE" => {
    if (docType === "Quotation") return "QA";
    if (docType === "Invoice") return "IV";
    return "RE";
  };

   // Handle date range selection for the calendar
  const handleDatesChange = (dates: string[]) => {
    setDateRange(dates);
  };

  const handleCloseCalendar = () => {
    setCalendarVisible(false);
    if (dateRange && dateRange.length > 0) {
      searchByDateRange(dateRange);
    }
  };

  // Fetch monthly report data
  const fetchMonthlyReportData = async (date: Date) => {
    if (!memberId) return;

    setIsLoading(true);
    try {
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      // Get all bills for the month
      const response = await CallAPIPrint.getBillsByDateRangeAPI(
        memberId,
        format(startDate, "yyyy-MM-dd"),
        format(endDate, "yyyy-MM-dd"),
      );

      if (response.error) {
        throw new Error(response.error);
      }

      const { summary, bills: responseBills } = response;
      setBills(responseBills ?? []);

      const [paidStr, totalStr] = (summary?.amount ?? "0/0").split("/");
      const paidOrders = parseInt(paidStr) || 0;
      const totalOrders = parseInt(totalStr) || 0;
      const unpaidOrders = totalOrders - paidOrders;

      setMonthlyTotals({
        totalSales: summary?.totalSale ?? 0,
        totalUnpaidSales: 0,
        totalOrders,
        paidOrders,
        unpaidOrders,
        averageOrderValue: summary?.averageSale ?? 0,
        totalExpenses: summary?.totalExpense ?? 0,
        totalExpenseCount: 0,
        vatExpenses: 0,
        whtExpenses: 0,
        averageExpenseAmount: 0,
        expensesByGroup: {},
        accountReceivable: summary?.accountReceivable ?? 0,
        adsSpend: summary?.adsSpend ?? 0,
        amount: summary?.amount ?? "0/0",
      });
    } catch (error) {
      console.error("Error fetching monthly report data:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: t("print.fetchError"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search bills by customer name
  const searchByCustomerName = async () => {
    if (!memberId || !searchQuery) return;

    setIsLoading(true);
    try {
      const response = await CallAPIPrint.searchBillsByCustomerAPI(
        memberId,
        searchQuery,
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setBills(response);

      if (response.length === 0) {
        setAlertConfig({
          visible: true,
          title: t("print.noResults"),
          message: t("print.noResultsMessage"),
          buttons: [
            {
              text: t("common.ok"),
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error searching by customer name:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: t("print.searchError"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search bills by customer phone
  const searchByCustomerPhone = async () => {
    if (!memberId || !searchQuery) return;

    setIsLoading(true);
    setBills([]);

    try {
      const response = await CallAPIPrint.searchBillsByPhoneAPI(
        memberId,
        searchQuery,
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setBills(response);

      if (response.length === 0) {
        setAlertConfig({
          visible: true,
          title: t("print.noResults"),
          message: t("print.noResultsMessage"),
          buttons: [
            {
              text: t("common.ok"),
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error searching by customer phone:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: t("print.searchError"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search bills by bill ID
  const searchByBillId = async () => {
    if (!memberId || !searchQuery) return;
    setIsLoading(true);
    try {
      const response = await CallAPIPrint.searchBillByIdAPI(
        memberId,
        searchQuery,
      );
      // If found, set as array for consistency
      if (response) {
        setBills([response]);
      } else {
        setBills([]);
        setAlertConfig({
          visible: true,
          title: t("print.noResults"),
          message: t("print.noResultsMessage"),
          buttons: [
            {
              text: t("common.ok"),
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error searching by bill ID:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: t("print.searchError"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search bills by date range
  const searchByDateRange = async (dates: string[]) => {
    if (!memberId || dates.length === 0) return;

    setIsLoading(true);
    try {
      let startDate, endDate;

      if (dates.length === 1) {
        // If only one date selected, use that day only
        startDate = format(new Date(dates[0]), "yyyy-MM-dd");
        endDate = format(new Date(dates[0]), "yyyy-MM-dd");

        console.log(" Single date selected :", startDate);
        console.log("Single date selected:", endDate);
      } else {
        // Sort dates to get start and end
        const sortedDates = dates.sort();
        startDate = format(new Date(sortedDates[0]), "yyyy-MM-dd");
        endDate = format(
          new Date(sortedDates[sortedDates.length - 1]),
          "yyyy-MM-dd",
        );
      }

      const response = await CallAPIPrint.getBillsByDateRangeAPI(
        memberId,
        startDate,
        endDate,
      );

      if (response.error) {
        throw new Error(response.error);
      }

      const responseBills = response.bills ?? response;
      setBills(responseBills);

      if (responseBills.length === 0) {
        setAlertConfig({
          visible: true,
          title: t("print.noResults"),
          message: t("print.noResultsForDates"),
          buttons: [
            {
              text: t("common.ok"),
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error searching by date range:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: t("print.searchError"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search button press
  const handleSearch = () => {
    switch (searchType) {
      case SEARCH_TYPES.CUSTOMER_NAME:
        searchByCustomerName();
        break;
      case SEARCH_TYPES.CUSTOMER_PHONE:
        searchByCustomerPhone();
        break;
      case SEARCH_TYPES.BILL_ID:
      case SEARCH_TYPES.QUOTATION_ID:
      case SEARCH_TYPES.INVOICE_ID:
        searchByBillId();
        break;
      case SEARCH_TYPES.DATE_RANGE:
        setCalendarVisible(true);
        break;
      default:
        break;
    }
  };

  // Handle month change for reports
  const handleMonthChange = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? subMonths(selectedMonth, 1)
        : new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1);

    setSelectedMonth(newDate);
    fetchMonthlyReportData(newDate);
  };

  // View invoice details
  const viewInvoiceDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
    // Set print step based on invoice's DocumentType immediately
    const docType = Array.isArray(invoice?.DocumentType)
      ? invoice.DocumentType[0]
      : invoice?.DocumentType;
    if (docType) {
      setSelectedPrintType(mapDocTypeToStep(docType));
    }
    setInvoiceModalVisible(true);
  };

  // Centralized function to close modal and refresh component
  const closeInvoiceModalAndRefresh = () => {
    setInvoiceModalVisible(false);
    // Clear any pending alerts when closing modal
    setAlertConfig({
      visible: false,
      title: "",
      message: "",
      buttons: [],
    });
    setTimeout(() => {
      setSelectedInvoice(null);
      setRefreshKey((prev) => prev + 1); // Force component refresh
    }, 100);
  };

  // Handle print action
  const handlePrint = () => {
    if (Platform.OS === "web") {
      // Show same options for web as mobile: "Income Report" and "Expense Report"
      setAlertConfig({
        visible: true,
        title: t("print.saveAsPdf"),
        message: t("print.saveAsPdfOption"),
        buttons: [
          {
            text: t("print.incomeReport"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              printIncomeReportHTMLContent();
            },
          },
          {
            text: t("print.expenseReport"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              printExpenseReportHTMLContent();
            },
          },
          {
            text: t("common.cancel"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
            style: "cancel",
          },
        ],
      });
    } else if (isMobile() || isTablet()) {
      // Show options for mobile: "Save as PDF" or "Cancel"
      setAlertConfig({
        visible: true,
        title: t("print.saveAsPdf"),
        message: t("print.saveAsPdfOption"),
        buttons: [
          {
            text: t("print.incomeReport"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              saveIncomeReportToPDF();
            },
          },
          {
            text: t("print.expenseReport"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              saveExpenseReportToPDF();
            },
          },
          {
            text: t("common.cancel"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
            style: "cancel",
          },
        ],
      });
    } else {
      setAlertConfig({
        visible: true,
        title: t("print.notSupported"),
        message: t("print.printOnlyWeb"),
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  // Function to print HTML Income Report content for web/desktop
  const printIncomeReportHTMLContent = () => {
    // Open window immediately to avoid popup blockers on web
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(
        "<html><body><h3>Generating Report...</h3></body></html>",
      );
    }

    try {
      // Generate HTML content using the template component
      const htmlContent = generateMonthlyReportHTML({
        selectedMonth,
        businessDetails,
        businessName,
        bills,
        t,
        formatCurrencyForPDF,
        formatDate,
        formatMonthYear,
      });

      // Update the existing window
      if (printWindow) {
        // Clear previous "Loading..." content
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      } else {
        // Fallback: create a blob and open it
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `income_report_${format(selectedMonth, "yyyy-MM")}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Close the window if we opened it but encountered an error
      if (printWindow) {
        printWindow.close();
      }

      console.error("❌ Error generating income report for web:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${(error as Error).message}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  // Function to print HTML Expense Report content for web/desktop
  const printExpenseReportHTMLContent = async () => {
    // Open window immediately to avoid popup blockers on web
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(
        "<html><body><h3>Generating Report...</h3></body></html>",
      );
    }

    try {
      // Call api getExpenseByDateRangeAPI
      if (!memberId) throw new Error("Member ID is null");
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);

      const response = await CallAPIPrint.getExpenseByDateRangeAPI(
        memberId,
        format(startDate, "yyyy-MM-dd"),
        format(endDate, "yyyy-MM-dd"),
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setExpenses(response);
      console.log("Expenses for the month:", response);

      // Calculate expense totals from the response
      const actualExpenses = response; // Include all expenses (including drafts)
      const totalExpenses = actualExpenses.reduce(
        (sum: number, expense: any) => sum + (Number(expense.amount) || 0),
        0,
      );
      const totalExpenseCount = actualExpenses.length;
      const vatExpenses = actualExpenses.filter(
        (expense: any) => expense.vat,
      ).length;
      const whtExpenses = actualExpenses.filter(
        (expense: any) => expense.withHoldingTax,
      ).length;
      const averageExpenseAmount =
        totalExpenseCount > 0 ? totalExpenses / totalExpenseCount : 0;

      // Group expenses by category
      const expensesByGroup: { [key: string]: number } = {};
      actualExpenses.forEach((expense: any) => {
        const group = expense.group || "Other";
        expensesByGroup[group] =
          (expensesByGroup[group] || 0) + (Number(expense.amount) || 0);
      });

      const expenseMonthlyTotals = {
        totalExpenses,
        totalExpenseCount,
        vatExpenses,
        whtExpenses,
        averageExpenseAmount,
        expensesByGroup,
      };

      // Generate HTML content for expense report
      const htmlContent = generateExpenseReportHTML({
        selectedMonth,
        businessDetails,
        businessName,
        monthlyTotals: expenseMonthlyTotals,
        expenses: response,
        t,
        formatCurrencyForPDF,
        formatDate,
        formatMonthYear,
      });

      // Update the existing window
      if (printWindow) {
        // Clear previous "Loading..." content
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      } else {
        // Fallback: create a blob and open it
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `expense_report_${format(selectedMonth, "yyyy-MM")}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Close the window if we opened it but encountered an error
      if (printWindow) {
        printWindow.close();
      }

      console.error("❌ Error generating expense report for web:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${(error as Error).message}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  // Handle print action for individual invoice
  const handlePrintInvoice = () => {
    if (!selectedInvoice) return;

    if (Platform.OS === "web") {
      // Use HTML content for web/desktop printing
      printInvoiceHTMLContent();
    } else {
      // For mobile, directly save as PDF without showing options dialog
      saveInvoiceToPDF();
    }
  };

  // Function to print individual invoice HTML content for web/desktop
  const printInvoiceHTMLContent = () => {
    if (!selectedInvoice) return;

    // Generate HTML content using the template component
    const htmlContent = generateInvoiceHTML({
      invoice: selectedInvoice,
      businessDetails,
      businessName,
      t,
      formatCurrencyForPDF,
      formatDate,
    });

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
        // Close modal after printing
        closeInvoiceModalAndRefresh(); // Use centralized function
      };
    } else {
      // Fallback: create a blob and open it
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${selectedInvoice.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      // Close modal after download
      closeInvoiceModalAndRefresh(); // Use centralized function
    }
  };

  // Function to save HTML content as PDF
  const saveIncomeReportToPDF = async () => {
    // Hide any previous loading indicator before starting
    setAlertConfig((prev) => ({ ...prev, visible: false }));

    // Show loading indicator
    setAlertConfig({
      visible: true,
      title: t("print.generating"),
      message: t("print.generatingPdf"),
      buttons: [],
    });

    try {
      // Generate HTML content for monthly report
      const htmlContent = generateMonthlyReportHTML({
        selectedMonth,
        businessDetails,
        businessName,
        bills,
        t,
        formatCurrencyForPDF,
        formatDate,
        formatMonthYear,
      });

      // Print the document
      await ExpoPrint.printAsync({
        html: htmlContent,
      });
      // Hide loading indicator
      setAlertConfig((prev) => ({ ...prev, visible: false }));
    } catch (error) {
      // Always hide loading indicator first
      setAlertConfig((prev) => ({ ...prev, visible: false }));
      console.log("PDF generation cancelled or failed:", error);
      // Check if it's a cancellation error (user dismissed the print dialog)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("dismissed") ||
        errorMessage.includes("user") ||
        errorMessage.includes("Printing did not complete") ||
        errorMessage.includes("did not complete")
      ) {
        // Do not show any alert
        return;
      }
      // Only show error for actual errors
      console.error("❌ Error generating monthly report PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${errorMessage}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  const saveExpenseReportToPDF = async () => {
    // Hide any previous loading indicator before starting
    setAlertConfig((prev) => ({ ...prev, visible: false }));

    // Show loading indicator
    setAlertConfig({
      visible: true,
      title: t("print.generating"),
      message: t("print.generatingPdf"),
      buttons: [],
    });

    try {
      // Call api getExpenseByDateRangeAPI
      if (!memberId) throw new Error("Member ID is null");
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);

      const response = await CallAPIPrint.getExpenseByDateRangeAPI(
        memberId,
        format(startDate, "yyyy-MM-dd"),
        format(endDate, "yyyy-MM-dd"),
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setExpenses(response);
      console.log("Expenses for the month:", response);

      // Calculate expense totals from the response
      const actualExpenses = response; // Include all expenses (including drafts)
      const totalExpenses = actualExpenses.reduce(
        (sum: number, expense: any) => sum + (Number(expense.amount) || 0),
        0,
      );
      const totalExpenseCount = actualExpenses.length;
      const vatExpenses = actualExpenses.filter(
        (expense: any) => expense.vat,
      ).length;
      const whtExpenses = actualExpenses.filter(
        (expense: any) => expense.withHoldingTax,
      ).length;
      const averageExpenseAmount =
        totalExpenseCount > 0 ? totalExpenses / totalExpenseCount : 0;

      // Group expenses by category
      const expensesByGroup: { [key: string]: number } = {};
      actualExpenses.forEach((expense: any) => {
        const group = expense.group || "Other";
        expensesByGroup[group] =
          (expensesByGroup[group] || 0) + (Number(expense.amount) || 0);
      });

      const expenseMonthlyTotals = {
        totalExpenses,
        totalExpenseCount,
        vatExpenses,
        whtExpenses,
        averageExpenseAmount,
        expensesByGroup,
      };

      // Generate HTML content for expense report
      const htmlContent = generateExpenseReportHTML({
        selectedMonth,
        businessDetails,
        businessName,
        monthlyTotals: expenseMonthlyTotals,
        expenses: response,
        t,
        formatCurrencyForPDF,
        formatDate,
        formatMonthYear,
      });

      await ExpoPrint.printAsync({
        html: htmlContent,
      });

      setAlertConfig((prev) => ({ ...prev, visible: false }));
    } catch (error) {
      setAlertConfig((prev) => ({ ...prev, visible: false }));
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("dismissed") ||
        errorMessage.includes("user") ||
        errorMessage.includes("Printing did not complete") ||
        errorMessage.includes("did not complete")
      ) {
        return;
      }
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${errorMessage}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    }
  };

  // Function to handle saving individual invoice as PDF for mobile
  const saveInvoiceToPDF = async () => {
    if (!selectedInvoice) return;

    // Show loading indicator
    setAlertConfig({
      visible: true,
      title: t("print.generating"),
      message: t("print.generatingPdf"),
      buttons: [],
    });

    try {
      const invoice = selectedInvoice;

      // Use mobile-optimized template for mobile devices
      const htmlContent = generateInvoiceHTML({
        invoice,
        businessDetails,
        businessName,
        t,
        formatCurrencyForPDF,
        formatDate,
      });

      // Print the document
      await ExpoPrint.printAsync({
        html: htmlContent,
      });

      // Hide loading indicator and close modal
      setAlertConfig((prev) => ({ ...prev, visible: false }));
      closeInvoiceModalAndRefresh(); // Use centralized function
    } catch (error) {
      console.log("PDF generation cancelled or failed:", error);

      // Check if it's a cancellation error (user dismissed the print dialog)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("dismissed") ||
        errorMessage.includes("user") ||
        errorMessage.includes("Printing did not complete") ||
        errorMessage.includes("did not complete")
      ) {
        console.log("📝 User cancelled PDF generation");
        // Don't show error alert for user cancellation, just hide loading and close modal
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        closeInvoiceModalAndRefresh();
        return;
      }

      // Only show error for actual errors
      console.error("❌ Error generating individual invoice PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${errorMessage}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              closeInvoiceModalAndRefresh(); // Use centralized function
            },
          },
        ],
      });
    }
  };

  // Handle print action for quotation
  const handlePrintQuotation = () => {
    if (!selectedInvoice) return;

    if (Platform.OS === "web") {
      printQuotationHTMLContent();
    } else {
      saveQuotationToPDF();
    }
  };

  // Function to print quotation HTML content for web/desktop
  const printQuotationHTMLContent = () => {
    if (!selectedInvoice) return;

    // Generate HTML content using the quotation template
    const htmlContent = generateQuotationHTML({
      quotation: selectedInvoice,
      businessDetails,
      businessName,
      t,
      formatCurrencyForPDF,
      formatDate,
    });

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
        // Close modal after printing
        closeInvoiceModalAndRefresh(); // Use centralized function
      };
    } else {
      // Fallback: create a blob and open it
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quotation_${selectedInvoice.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      // Close modal after download
      closeInvoiceModalAndRefresh(); // Use centralized function
    }
  };

  // Function to save quotation as PDF for mobile
  const saveQuotationToPDF = async () => {
    if (!selectedInvoice) return;

    setAlertConfig({
      visible: true,
      title: t("print.generating"),
      message: t("print.generatingPdf"),
      buttons: [],
    });

    try {
      const htmlContent = generateQuotationHTML({
        quotation: selectedInvoice,
        businessDetails,
        businessName,
        t,
        formatCurrencyForPDF,
        formatDate,
      });

      await ExpoPrint.printAsync({
        html: htmlContent,
      });

      setAlertConfig((prev) => ({ ...prev, visible: false }));
      closeInvoiceModalAndRefresh(); // Use centralized function
    } catch (error) {
      console.log("PDF generation cancelled or failed:", error);

      // Check if it's a cancellation error (user dismissed the print dialog)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes("cancelled") ||
        errorMessage.includes("dismissed") ||
        errorMessage.includes("user") ||
        errorMessage.includes("Printing did not complete") ||
        errorMessage.includes("did not complete")
      ) {
        console.log("📝 User cancelled PDF generation");
        // Don't show error alert for user cancellation, just hide loading and close modal
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        closeInvoiceModalAndRefresh();
        return;
      }

      // Only show error for actual errors
      console.error("❌ Error generating quotation PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${errorMessage}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              closeInvoiceModalAndRefresh(); // Use centralized function
            },
          },
        ],
      });
    }
  };

  // Handle print action for receipt
  const handlePrintReceipt = () => {
    if (!selectedInvoice) return;

    if (Platform.OS === "web") {
      printReceiptHTMLContent();
    } else {
      saveReceiptToPDF();
    }
  };

  // Function to print receipt HTML content for web/desktop
  const printReceiptHTMLContent = () => {
    if (!selectedInvoice) return;

    // Generate HTML content using the receipt template
    const htmlContent = generateReceiptHTML({
      invoice: selectedInvoice,
      businessDetails,
      businessName,
      t,
      formatCurrencyForPDF,
      formatDate,
    });

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
        // Close modal after printing
        closeInvoiceModalAndRefresh(); // Use centralized function
      };
    } else {
      // Fallback: create a blob and open it
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt_${selectedInvoice.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      // Close modal after download
      closeInvoiceModalAndRefresh(); // Use centralized function
    }
  };

  // Function to save receipt as PDF for mobile
  const saveReceiptToPDF = async () => {
    if (!selectedInvoice) return;

    setAlertConfig({
      visible: true,
      title: t("print.generating"),
      message: t("print.generatingPdf"),
      buttons: [],
    });

    try {
      const htmlContent = generateReceiptHTML({
        invoice: selectedInvoice,
        businessDetails,
        businessName,
        t,
        formatCurrencyForPDF,
        formatDate,
      });

      await ExpoPrint.printAsync({
        html: htmlContent,
      });

      setAlertConfig((prev) => ({ ...prev, visible: false }));
      closeInvoiceModalAndRefresh(); // Use centralized function
    } catch (error) {
      console.error("Error generating receipt PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${
          (error as Error).message
        }`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              closeInvoiceModalAndRefresh(); // Use centralized function
            },
          },
        ],
      });
    }
  };

  // Function to share PDF file
  const handleSharePdf = async (filePath: string) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: "application/pdf",
          dialogTitle: "Share Income Report",
          UTI: "com.adobe.pdf",
        });

        // Show success message
        setAlertConfig({
          visible: true,
          title: t("print.success"),
          message: t("print.pdfSharedMessage"),
          buttons: [
            {
              text: t("common.ok"),
              onPress: () =>
                setAlertConfig((prev) => ({ ...prev, visible: false })),
            },
          ],
        });
      } else {
        throw new Error("Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfSharingError")}: ${(error as Error).message}`,
        buttons: [
          {
            text: t("common.ok"),
            onPress: () =>
              setAlertConfig((prev) => ({ ...prev, visible: false })),
          },
        ],
      });
    } finally {
      setPdfPreviewModalVisible(false);
    }
  };

  // Helper to get display ID based on document type
  const getDisplayId = (invoice: any) => {
    if (!invoice) return "";

    // If searching by specific ID type, return that ID if available
    if (searchType === SEARCH_TYPES.INVOICE_ID && invoice.invoiceId) {
      return invoice.invoiceId;
    }
    if (searchType === SEARCH_TYPES.QUOTATION_ID && invoice.quotationId) {
      return invoice.quotationId;
    }
    if (searchType === SEARCH_TYPES.BILL_ID && invoice.billId) {
      return invoice.billId;
    }

    const docType = Array.isArray(invoice?.DocumentType)
      ? invoice.DocumentType[0]
      : invoice?.DocumentType;

    return docType === "Quotation"
      ? invoice.quotationId
      : docType === "Invoice"
        ? invoice.invoiceId
        : invoice.billId;
  };

  // Helper to get document title based on document type
  const getDocumentTitle = (invoice: any) => {
    if (!invoice) return "";
    const docType = Array.isArray(invoice?.DocumentType)
      ? invoice.DocumentType[0]
      : invoice?.DocumentType;

    if (docType === "Quotation") return t("print.quotation");
    if (docType === "Invoice") return t("print.invoice");

    return isVatRegistered ? t("print.taxInvoice") : t("print.receipt");
  };

  // Render invoice card
  const renderInvoiceCard = (invoice: any) => {
    const displayId = getDisplayId(invoice);

    return (
      <TouchableOpacity
        key={invoice.id}
        className={`p-4 mb-3 rounded-lg border ${
          theme === "dark"
            ? "border-zinc-700 bg-transparent"
            : "border-gray-200 bg-white"
        }`}
        onPress={() => viewInvoiceDetails(invoice)}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <View className="flex-row">
              <CustomText className="mb-1">#</CustomText>
              <CustomText weight="bold" className="mb-1 text-base">
                {displayId}
              </CustomText>
            </View>
            {invoice.isSplitChild && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  borderWidth: 1,
                  borderColor: theme === "dark" ? "#555" : "#d1d5db",
                  borderRadius: 4,
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                  marginBottom: 4,
                  gap: 3,
                }}
              >
                <Ionicons
                  name="sync-outline"
                  size={10}
                  color={theme === "dark" ? "#9ca3af" : "#6b7280"}
                />
                <CustomText style={{ fontSize: 10, color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                  {invoice.parentQuotationId ?? invoice.invoiceId}
                </CustomText>
                <CustomText style={{ fontSize: 10, color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                  {invoice.splitPercent}%
                </CustomText>
              </View>
            )}
            <View className="flex-row gap-1">
              <CustomText className="mb-1">{invoice.cName}</CustomText>
              <CustomText className="mb-1">{invoice.cLastName}</CustomText>
            </View>
            <CustomText className="mb-1">
              {formatDate(invoice.updatedAt)}
            </CustomText>
          </View>
          <View className="items-end">
            <CustomText weight="bold" className="text-base">
              {invoice.cashStatus
                ? formatCurrency(calculateInvoiceTotal(invoice))
                : formatCurrency(Number(invoice.totalInvoice || 0))}
            </CustomText>
            <View
              className={`mt-2 p-1 px-2 rounded-full ${
                invoice.cashStatus ? "bg-green-700" : "bg-orange-700"
              }`}
            >
              <CustomText
                className="text-white text-xs pt-1 "
                style={{ color: "white", fontSize: 11 }}
              >
                {invoice.cashStatus
                  ? t("bill.status.paid")
                  : t("bill.status.unpaid")}
              </CustomText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      key={refreshKey} // Add key for component refresh
      className={`flex-1 ${useBackgroundColorClass()}`}
      style={{ paddingTop: Platform.OS === "web" ? 20 : 0 }}
    >
      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseCalendar}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          activeOpacity={1}
          onPress={handleCloseCalendar}
        >
          <View
            style={{
              width: isMobile() ? "90%" : "40%",
              minWidth: 300,
              maxWidth: 500,
              backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <MultiDateCalendar onDatesChange={handleDatesChange} />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        visible={invoiceModalVisible}
        onClose={closeInvoiceModalAndRefresh}
        selectedInvoice={selectedInvoice}
        printRef={printRef}
        theme={theme}
        t={t}
        isVatRegistered={isVatRegistered}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getDocumentTitle={getDocumentTitle}
        getDisplayId={getDisplayId}
        selectedPrintType={selectedPrintType}
        getAvailablePrintSteps={getAvailablePrintSteps}
        isPrintStepCompleted={isPrintStepCompleted}
        getPrintStepBackgroundColor={getPrintStepBackgroundColor}
        getPrintStepBorderColor={getPrintStepBorderColor}
        getPrintStepOpacity={getPrintStepOpacity}
        getPrintStepIconColor={getPrintStepIconColor}
        getPrintStepDescriptionColor={getPrintStepDescriptionColor}
        handlePrintQuotation={handlePrintQuotation}
        handlePrintInvoice={handlePrintInvoice}
        handlePrintReceipt={handlePrintReceipt}
      />

      {/* PDF Preview Modal */}
      <Modal
        visible={pdfPreviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPdfPreviewModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
          activeOpacity={1}
          onPress={() => setPdfPreviewModalVisible(false)}
        >
          <View
            style={{
              width: isMobile() ? "90%" : "70%",
              maxWidth: 800,
              backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <CustomText weight="bold" className="text-lg">
                {t("print.pdfPreview")}
              </CustomText>
              <TouchableOpacity
                onPress={() => setPdfPreviewModalVisible(false)}
                className="p-2"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme === "dark" ? "#ffffff" : "#000000"}
                />
              </TouchableOpacity>
            </View>

            {/* PDF preview component */}
            {pdfPreviewUri && (
              <View className="m-4 p-4 items-center">
                <FontAwesome
                  name="file-pdf-o"
                  size={64}
                  color={theme === "dark" ? "#959595" : "#3b3b3b"}
                />
                <CustomText className="text-center mt-4 text-zinc-500">
                  {t("print.pdfReady")}
                </CustomText>
              </View>
            )}

            {/* Action buttons */}
            <View className="flex-row justify-center">
              <CustomButton
                title={t("print.sharePdf")}
                handlePress={() => {
                  if (pdfPreviewUri) {
                    handleSharePdf(pdfPreviewUri);
                  }
                }}
                containerStyles="px-8 mr-4"
                textStyles="!text-white"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main Content */}
      <ScrollView>
        <View
          style={{
            maxWidth: Platform.OS === "web" ? 1000 : "100%",
            width: "100%",
            paddingHorizontal: 16,
            alignSelf: "center",
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6 pt-4">
            {!isMobile() && (
              <CustomText weight="bold" className="text-2xl">
                {t("print.printCenter")}
              </CustomText>
            )}

            {activeTab === TAB_INDICES.MONTHLY_REPORT && (
              <TouchableOpacity
                onPress={handlePrint}
                className={`flex-row items-center ${
                  isMobile() ? "ml-auto" : ""
                }`}
                activeOpacity={1}
              >
                <Ionicons
                  name="print"
                  size={24}
                  color={theme === "dark" ? "#ffffff" : "#393838"}
                  style={{ marginRight: 8 }}
                />
                <CustomText>{t("print.monthlyReport")}</CustomText>
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <View className="flex-row mb-6">
            <TouchableOpacity
              activeOpacity={1}
              className="p-3 px-6 rounded-t-lg"
              style={{
                backgroundColor:
                  activeTab === TAB_INDICES.MONTHLY_REPORT
                    ? theme === "dark"
                      ? "transparent"
                      : "#ffffff"
                    : theme === "dark"
                      ? "#212121"
                      : "#e7e7e7",
                borderBottomWidth:
                  activeTab === TAB_INDICES.MONTHLY_REPORT ? 2 : 0,
                borderBottomColor:
                  activeTab === TAB_INDICES.MONTHLY_REPORT
                    ? "#04ecc1"
                    : "transparent",
              }}
              onPress={() => {
                setActiveTab(TAB_INDICES.MONTHLY_REPORT);
                // Automatically fetch the current month's data when switching to Monthly Report tab
                const currentDate = new Date();
                setSelectedMonth(currentDate);
                fetchMonthlyReportData(currentDate);
              }}
            >
              <CustomText
                weight={
                  activeTab === TAB_INDICES.MONTHLY_REPORT ? "bold" : "regular"
                }
              >
                {t("print.monthlyReport")}
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={1}
              className="p-3 px-6 rounded-t-lg"
              style={{
                backgroundColor:
                  activeTab === TAB_INDICES.INDIVIDUAL_INVOICE
                    ? theme === "dark"
                      ? "transparent"
                      : "#ffffff"
                    : theme === "dark"
                      ? "#212121"
                      : "#e7e7e7",
                borderBottomWidth:
                  activeTab === TAB_INDICES.INDIVIDUAL_INVOICE ? 2 : 0,
                borderBottomColor:
                  activeTab === TAB_INDICES.INDIVIDUAL_INVOICE
                    ? "#04ecc1"
                    : "transparent",
              }}
              onPress={() => setActiveTab(TAB_INDICES.INDIVIDUAL_INVOICE)}
            >
              <CustomText
                weight={
                  activeTab === TAB_INDICES.INDIVIDUAL_INVOICE
                    ? "bold"
                    : "regular"
                }
              >
                {isVatRegistered
                  ? t("print.taxInvoiceSearch")
                  : t("print.receiptSearch")}
              </CustomText>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View
            className={`p-4 rounded-lg bg-transparent mb-8`}
            style={{
              minHeight: 400,
            }}
          >
            {activeTab === TAB_INDICES.MONTHLY_REPORT ? (
              // Monthly Report Tab
              <>
                <View className="flex-row justify-between items-center mb-6">
                  <TouchableOpacity
                    onPress={() => handleMonthChange("prev")}
                    className="p-2"
                  >
                    <Ionicons
                      name="chevron-back"
                      size={24}
                      color={theme === "dark" ? "#ffffff" : "#000000"}
                    />
                  </TouchableOpacity>

                  <CustomText weight="bold" className="text-xl">
                    {formatMonthYear(selectedMonth, t)}
                  </CustomText>

                  <TouchableOpacity
                    onPress={() => handleMonthChange("next")}
                    className="p-2"
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={24}
                      color={theme === "dark" ? "#ffffff" : "#000000"}
                    />
                  </TouchableOpacity>
                </View>

                {isLoading ? (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#04ecc1" />
                  </View>
                ) : (
                  <>
                    {/* Monthly Statistics */}
                    <View className="flex-row flex-wrap mb-4">
                      {/* Total Sale */}
                      <View className={`p-2 ${isMobile() ? "w-full" : "w-1/2"} mb-3`}>
                        <View style={{ backgroundColor: theme === "dark" ? "#2D2D2D" : "#e1e1e1" }} className="p-4 rounded-lg">
                          <CustomText className="mb-1">{t("print.totalSales")}</CustomText>
                          <CustomText weight="bold" className="text-xl">
                            {formatCurrency(monthlyTotals.totalSales)}
                          </CustomText>
                        </View>
                      </View>

                      {/* Account Receivable */}
                      <View className={`p-2 ${isMobile() ? "w-full" : "w-1/2"} mb-3`}>
                        <View style={{ backgroundColor: theme === "dark" ? "#2D2D2D" : "#e1e1e1" }} className="p-4 rounded-lg">
                          <CustomText className="mb-1">{t("print.accountReceivable")}</CustomText>
                          <CustomText weight="bold" className="text-xl">
                            {formatCurrency(monthlyTotals.accountReceivable)}
                          </CustomText>
                        </View>
                      </View>

                      {/* Total Expense */}
                      <View className={`p-2 ${isMobile() ? "w-full" : "w-1/2"} mb-3`}>
                        <View style={{ backgroundColor: theme === "dark" ? "#2D2D2D" : "#e1e1e1" }} className="p-4 rounded-lg">
                          <CustomText className="mb-1">{t("print.totalExpenses")}</CustomText>
                          <CustomText weight="bold" className="text-xl">
                            {formatCurrency(monthlyTotals.totalExpenses)}
                          </CustomText>
                        </View>
                      </View>

                      {/* Ads Spend */}
                      <View className={`p-2 ${isMobile() ? "w-full" : "w-1/2"} mb-3`}>
                        <View style={{ backgroundColor: theme === "dark" ? "#2D2D2D" : "#e1e1e1" }} className="p-4 rounded-lg">
                          <CustomText className="mb-1">{t("print.adsSpend")}</CustomText>
                          <CustomText weight="bold" className="text-xl">
                            {formatCurrency(monthlyTotals.adsSpend)}
                          </CustomText>
                        </View>
                      </View>

                      {/* Paid / Total (parent bills) */}
                      <View className={`p-2 ${isMobile() ? "w-full" : "w-1/2"} mb-3`}>
                        <View style={{ backgroundColor: theme === "dark" ? "#2D2D2D" : "#e1e1e1" }} className="p-4 rounded-lg">
                          <CustomText className="mb-1">{t("print.paidOrders")}</CustomText>
                          <View className="flex-row items-center">
                            <CustomText weight="bold" className="text-xl">
                              {monthlyTotals.paidOrders}
                            </CustomText>
                            <CustomText className="text-xl mx-1">/</CustomText>
                            <CustomText weight="bold" className="text-xl">
                              {monthlyTotals.totalOrders}
                            </CustomText>
                            <View className="ml-2 pt-1 px-2 rounded-full bg-green-700">
                              <CustomText style={{ color: "white", fontSize: 10 }}>
                                {monthlyTotals.totalOrders > 0
                                  ? `${Math.round((monthlyTotals.paidOrders / monthlyTotals.totalOrders) * 100)}%`
                                  : "0%"}
                              </CustomText>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Average Sale */}
                      <View className={`p-2 ${isMobile() ? "w-full" : "w-1/2"} mb-3`}>
                        <View style={{ backgroundColor: theme === "dark" ? "#2D2D2D" : "#e1e1e1" }} className="p-4 rounded-lg">
                          <CustomText className="mb-1">{t("print.avgOrderValue")}</CustomText>
                          <CustomText weight="bold" className="text-xl">
                            {formatCurrency(monthlyTotals.averageOrderValue)}
                          </CustomText>
                        </View>
                      </View>
                    </View>

                    {/* Monthly Invoices */}
                    <View className="flex-row">
                      <CustomText weight="bold" className="mb-4 text-lg pt-4">
                        {t("print.allDocuments")}
                      </CustomText>

                      <CustomText
                        weight="bold"
                        className="mb-4 text-lg ml-2 pt-4"
                      >
                        ({bills.length})
                      </CustomText>
                    </View>

                    {bills.length > 0 ? (
                      bills.map((invoice) => renderInvoiceCard(invoice))
                    ) : (
                      <View className="items-center justify-center py-10">
                        <Ionicons
                          name="document-text-outline"
                          size={50}
                          color={theme === "dark" ? "#555555" : "#cccccc"}
                        />
                        <CustomText className="mt-4 text-center text-zinc-500">
                          {t("print.noInvoicesForMonth")}
                        </CustomText>
                      </View>
                    )}
                  </>
                )}
              </>
            ) : (
              // Individual Invoice Search Tab
              <>
                <CustomText weight="bold" className="mb-4 text-lg">
                  {isVatRegistered
                    ? t("print.findTaxInvoice")
                    : t("print.findReceipt")}
                </CustomText>

                <View className="flex-row mb-4 flex-wrap">
                  <View
                    className={`${isMobile() ? "w-full mb-4" : "w-1/3 pr-2"}`}
                  >
                    <Dropdown2
                      title={t("print.searchBy")}
                      options={[
                        {
                          label: t("print.customerName"),
                          value: SEARCH_TYPES.CUSTOMER_NAME,
                        },
                        {
                          label: t("print.customerPhone"),
                          value: SEARCH_TYPES.CUSTOMER_PHONE,
                        },
                        {
                          label: t("print.dateRange"),
                          value: SEARCH_TYPES.DATE_RANGE,
                        },
                        ...(isDocumentTypeAvailable("Receipt")
                          ? [
                              {
                                label: t("print.billId"),
                                value: SEARCH_TYPES.BILL_ID,
                              },
                            ]
                          : []),
                        ...(isDocumentTypeAvailable("Quotation")
                          ? [
                              {
                                label: t("print.quotationId"),
                                value: SEARCH_TYPES.QUOTATION_ID,
                              },
                            ]
                          : []),
                        ...(isDocumentTypeAvailable("Invoice")
                          ? [
                              {
                                label: t("print.invoiceId"),
                                value: SEARCH_TYPES.INVOICE_ID,
                              },
                            ]
                          : [])
                      ]}
                      placeholder={t("print.selectSearchType")}
                      selectedValue={t(`print.${searchType}`)}
                      onValueChange={setSearchType}
                      bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                      bgChoiceColor={theme === "dark" ? "#212121" : "#e7e7e7"}
                      textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                    />
                  </View>

                  {searchType !== SEARCH_TYPES.DATE_RANGE && (
                    <View
                      className={`${isMobile() ? "w-full mb-4" : "w-1/3 px-1"}`}
                    >
                      <FormField2
                        title={
                          searchType === SEARCH_TYPES.CUSTOMER_NAME
                            ? t("print.enterCustomerName")
                            : searchType === SEARCH_TYPES.CUSTOMER_PHONE
                              ? t("print.enterCustomerPhone")
                              : searchType === SEARCH_TYPES.QUOTATION_ID
                                ? t("print.enterQuotationId")
                                : searchType === SEARCH_TYPES.INVOICE_ID
                                  ? t("print.enterInvoiceId")
                                  : t("print.enterBillId")
                        }
                        value={searchQuery}
                        handleChangeText={setSearchQuery}
                        placeholder={
                          searchType === SEARCH_TYPES.CUSTOMER_NAME
                            ? t("bill.enterName")
                            : searchType === SEARCH_TYPES.CUSTOMER_PHONE
                              ? "0812345678"
                              : searchType === SEARCH_TYPES.QUOTATION_ID
                                ? "QT2025/123 or 2025/123 or 123"
                                : searchType === SEARCH_TYPES.INVOICE_ID
                                  ? "INV2025/123 or 2025/123 or 123"
                                  : "REC2025/123 or 2025/123 or 123"
                        }
                        bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                        placeholderTextColor={
                          theme === "dark" ? "#606060" : "#b1b1b1"
                        }
                        textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                        keyboardType={
                          searchType === SEARCH_TYPES.CUSTOMER_PHONE
                            ? "phone-pad"
                            : "default"
                        }
                      />
                    </View>
                  )}

                  <View
                    className={`${
                      isMobile() ? "w-full" : "w-1/3 pl-2"
                    } flex justify-end`}
                  >
                    <CustomButton
                      title={t("print.search")}
                      handlePress={handleSearch}
                      containerStyles={isMobile() ? "" : "mt-6 "}
                      textStyles="!text-white"
                    />
                  </View>
                </View>

                {isLoading ? (
                  <View className="flex-1 justify-center items-center py-10">
                    <ActivityIndicator size="large" color="#04ecc1" />
                  </View>
                ) : (
                  <>
                    {searchType === SEARCH_TYPES.DATE_RANGE &&
                      dateRange.length > 0 && (
                        <View className="flex-row mb-4 p-4 rounded-lg">
                          <CustomText>
                            {t("print.searchingDateRange")}
                          </CustomText>
                          <CustomText>
                            {dateRange.length === 1
                              ? formatDate(dateRange[0])
                              : `${formatDate(dateRange[0])} - ${formatDate(
                                  dateRange[dateRange.length - 1],
                                )}`}
                          </CustomText>
                        </View>
                      )}

                    {bills.length > 0 ? (
                      <>
                        <View className="flex-row mb-4">
                          <CustomText weight="bold" className="mb-4">
                            {t("print.searchResults")}
                          </CustomText>
                          <CustomText weight="bold" className="mb-4 ml-2">
                            {bills.length}
                          </CustomText>
                        </View>
                        {bills.map((invoice) => renderInvoiceCard(invoice))}
                      </>
                    ) : (
                      <View className="items-center justify-center py-10">
                        <Ionicons
                          name="search-outline"
                          size={50}
                          color={theme === "dark" ? "#555555" : "#cccccc"}
                        />
                        <CustomText className="mt-4 text-center text-zinc-500">
                          {t("print.searchForInvoices")}
                        </CustomText>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </View>
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
