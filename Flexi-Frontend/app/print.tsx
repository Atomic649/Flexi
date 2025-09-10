import React, { useEffect, useRef, useState } from "react";
import {
  View,
  SafeAreaView,
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
import FormField2 from "@/components/FormField2";
import Dropdown2 from "@/components/Dropdown2";
import {CustomButton} from "@/components/CustomButton";
import CustomAlert from "@/components/CustomAlert";
import CallAPIPrint from "@/api/print_api";
import { getMemberId, getBusinessId } from "@/utils/utility";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { isMobile } from "@/utils/responsive";
import * as Sharing from "expo-sharing";
import * as ExpoPrint from "expo-print";
import { useBusiness } from "@/providers/BusinessProvider";
import CallAPIBusiness from "@/api/business_api";
import { generateMonthlyReportHTML } from "@/components/PDFTemplates/MonthlySaleReportTemplate";
import {generateExpenseReportHTML} from "@/components/PDFTemplates/MonthlyExpenseReportTemplate";
import { generateInvoiceHTML } from "@/components/PDFTemplates/InvoiceTemplate";
import { generateQuotationHTML } from "@/components/PDFTemplates/QuotationTemplate";
import { generateInvoiceHTML as generateReceiptHTML } from "@/components/PDFTemplates/ReceiptTemplate";

// Constants for search types and tab indices
const SEARCH_TYPES = {
  CUSTOMER_NAME: "customerName",
  BILL_ID: "billId",
  DATE_RANGE: "dateRange",
};

const TAB_INDICES = {
  MONTHLY_REPORT: 0,
  INDIVIDUAL_INVOICE: 1,
};

// Format currency
const formatCurrency = (amount: number) => {
  // Original formatting that causes encoding issues: return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
  // Instead format without currency symbol and add THB manually
  return (
    new Intl.NumberFormat("th-TH", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " THB"
  );
};

// Format currency specifically for PDF to avoid Thai Baht symbol encoding issues
const formatCurrencyForPDF = (amount: number) => {
  return (
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " THB"
  );
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

// Helper function to calculate total from items and discounts
const calculateInvoiceTotal = (invoice: any) => {
  let itemsTotal = 0;
  
  // Calculate total from product items
  if (Array.isArray(invoice.product) && invoice.product.length > 0) {
    itemsTotal = invoice.product.reduce((sum: number, item: any) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);
  } else {
    // For single product (legacy format)
    itemsTotal = (invoice.price || 0) * (invoice.amount || 1);
  }
  
  // Subtract total discounts
  const totalDiscount = (invoice.discount || 0) + (invoice.billLevelDiscount || 0);
  
  return itemsTotal - totalDiscount;
};

export default function Print() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { businessName, vat, DocumentType: contextDocumentTypes } = useBusiness();
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
    // Add expense-specific totals
    totalExpenses: 0,
    totalExpenseCount: 0,
    vatExpenses: 0,
    whtExpenses: 0,
    averageExpenseAmount: 0,
    expensesByGroup: {} as { [key: string]: number },
  });

  // Add expenses state
  const [expenses, setExpenses] = useState<any[]>([]);

  // Check business is Vat registered (use BusinessProvider vat value)
  const isVatRegistered = vat === true;

  // Print progression state - start with first available type
  const [selectedPrintType, setSelectedPrintType] = useState<"QA" | "IV" | "RE">("QA");

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
    if (isPrintStepCompleted(step)) return theme === "dark" ? "#18181b" : "#ffffff";
    return theme === "dark" ? "#666" : "#999";
  };

  const getPrintStepDescriptionColor = (step: "QA" | "IV" | "RE"): string => {
    if (isPrintStepCompleted(step)) return theme === "dark" ? "#c9c9c9" : "#666";
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
        }
      } catch (error) {
        console.error("Error fetching credentials:", error);
      }
    };

    fetchCredentials();
  }, []);

  // Fetch business details for the PDF report
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        if (memberId) {
          // Fetch complete business details
          const response = await CallAPIBusiness.getBusinessDetailsAPI(
            memberId
          );
          setBusinessDetails(response);
          console.log("Business Details :", response);
        }
      } catch (error) {
        console.error("Error fetching business details:", error);
      }
    };

    fetchBusinessDetails();
  }, [memberId]);

  // Initialize selectedPrintType based on selectedInvoice DocumentType
  useEffect(() => {
    if (selectedInvoice && selectedInvoice.DocumentType) {
      const docType = Array.isArray(selectedInvoice.DocumentType) 
        ? selectedInvoice.DocumentType[0] 
        : selectedInvoice.DocumentType;
      
      // Map DocumentType to print step
      if (docType === "Quotation") {
        setSelectedPrintType("QA");
      } else if (docType === "Invoice") {
        setSelectedPrintType("IV");
      } else if (docType === "Receipt") {
        setSelectedPrintType("RE");
      }
    } else if (contextDocumentTypes) {
      // Fallback to first available if no selectedInvoice
      const availableSteps = getAvailablePrintSteps();
      if (availableSteps.length > 0) {
        setSelectedPrintType(availableSteps[0]);
      }
    }
  }, [selectedInvoice, contextDocumentTypes]);

  // Handle date range selection for the calendar
  const handleDatesChange = (dates: string[]) => {
    setDateRange(dates);
    // setCalendarVisible(false);

    // If dates were selected, search with those dates
    if (dates && dates.length > 0) {
      searchByDateRange(dates);
      console.log("Selected Dates:", dates);
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
        format(endDate, "yyyy-MM-dd")
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setBills(response);

      // Calculate monthly totals
      if (response && response.length > 0) {
        const totalSales = response.reduce(
          (sum: number, bill: any) => {
            // Include only bills that are paid OR are receipts
            if (bill.cashStatus || bill.DocumentType === "Receipt") {
              return sum + calculateInvoiceTotal(bill);
            }
            return sum;
          },
          0
        );

        const totalUnpaidSales = response.reduce(
          (sum: number, bill: any) => {
            // Include only bills that are unpaid AND not receipts
            if (!bill.cashStatus && bill.DocumentType !== "Receipt") {
              return sum + calculateInvoiceTotal(bill);
            }
            return sum;
          },
          0
        );

        const paidOrders = response.filter(
          (bill: any) => bill.cashStatus
        ).length;
        const unpaidOrders = response.length - paidOrders;

        setMonthlyTotals({
          totalSales,
          totalUnpaidSales,
          totalOrders: response.length,
          paidOrders,
          unpaidOrders,
          averageOrderValue: paidOrders > 0 ? totalSales / paidOrders : 0,
          totalExpenses: 0,
          totalExpenseCount: 0,
          vatExpenses: 0,
          whtExpenses: 0,
          averageExpenseAmount: 0,
          expensesByGroup: {},
        });
      } else {
        setMonthlyTotals({
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
          expensesByGroup: {},
        });
      }
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
        searchQuery
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

  // Search bills by bill ID
  const searchByBillId = async () => {
    if (!memberId || !searchQuery) return;
    setIsLoading(true);
    try {
      const response = await CallAPIPrint.searchBillByIdAPI(
        memberId,
        searchQuery
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
          "yyyy-MM-dd"
        );
      }

      const response = await CallAPIPrint.getBillsByDateRangeAPI(
        memberId,
        startDate,
        endDate
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setBills(response);

      if (response.length === 0) {
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
      case SEARCH_TYPES.BILL_ID:
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
      setRefreshKey(prev => prev + 1); // Force component refresh
    }, 100);
  };

  // Handle print action
  const handlePrint = () => {
    if (Platform.OS === "web") {
      // Use HTML content for web/desktop printing
      printHTMLContent();
    } else if (isMobile()) {
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

  // Function to print HTML Monthly content for web/desktop
  const printHTMLContent = () => {
    // Generate HTML content using the template component
    const htmlContent = generateMonthlyReportHTML({
      selectedMonth,
      businessDetails,
      businessName,
      monthlyTotals,
      bills,
      t,
      formatCurrencyForPDF,
      formatDate,
      formatMonthYear,
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
        monthlyTotals,
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('cancelled') || 
          errorMessage.includes('dismissed') || 
          errorMessage.includes('user') ||
          errorMessage.includes('Printing did not complete') ||
          errorMessage.includes('did not complete')) {
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

  const saveExpenseReportToPDF = async () =>{
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
        format(endDate, "yyyy-MM-dd")
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setExpenses(response);
      console.log("Expenses for the month:", response);

      // Calculate expense totals from the response
      const actualExpenses = response; // Include all expenses (including drafts)
      const totalExpenses = actualExpenses.reduce((sum: number, expense: any) => sum + (Number(expense.amount) || 0), 0);
      const totalExpenseCount = actualExpenses.length;
      const vatExpenses = actualExpenses.filter((expense: any) => expense.vat).length;
      const whtExpenses = actualExpenses.filter((expense: any) => expense.withHoldingTax).length;
      const averageExpenseAmount = totalExpenseCount > 0 ? totalExpenses / totalExpenseCount : 0;

      // Group expenses by category
      const expensesByGroup: { [key: string]: number } = {};
      actualExpenses.forEach((expense: any) => {
        const group = expense.group || 'Other';
        expensesByGroup[group] = (expensesByGroup[group] || 0) + (Number(expense.amount) || 0);
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
      const errorMessage = error instanceof Error ? error.message : String(error);
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
  }

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
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('cancelled') || 
          errorMessage.includes('dismissed') || 
          errorMessage.includes('user') ||
          errorMessage.includes('Printing did not complete') ||
          errorMessage.includes('did not complete')) {
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('cancelled') || 
          errorMessage.includes('dismissed') || 
          errorMessage.includes('user') ||
          errorMessage.includes('Printing did not complete') ||
          errorMessage.includes('did not complete')) {
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
        message: `${t("print.pdfGenerationError")}: ${(error as Error).message}`,
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

  // Render invoice card
  const renderInvoiceCard = (invoice: any) => {
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
                {invoice.billId}
              </CustomText>
            </View>
            <View className="flex-row gap-1">
              <CustomText className="mb-1">{invoice.cName}</CustomText>
              <CustomText className="mb-1">{invoice.cLastName}</CustomText>
            </View>
            <CustomText className="mb-1">
              {formatDate(invoice.purchaseAt)}
            </CustomText>
          </View>
          <View className="items-end">
            <CustomText weight="bold" className="text-base">
              {formatCurrency(calculateInvoiceTotal(invoice))}
            </CustomText>
            <View
              className={`mt-2 p-1 px-2 rounded-full ${
                invoice.cashStatus ? "bg-green-700" : "bg-orange-700"
              }`}
            >
              <CustomText
                className="text-white text-xs"
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
    <SafeAreaView
      key={refreshKey} // Add key for component refresh
      className={`flex-1 ${useBackgroundColorClass()}`}
      style={{ paddingTop: Platform.OS === "web" ? 20 : 0 }}
    >
      {/* Calendar Modal */}
      <Modal
        visible={calendarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCalendarVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          activeOpacity={1}
          onPress={() => setCalendarVisible(false)}
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
      <Modal
        visible={invoiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeInvoiceModalAndRefresh} // Use centralized function
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: isMobile() ? "95%" : "60%",
              maxWidth: 700,
              backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
              borderRadius: 10,
              padding: 20,
            }}
          >
            {selectedInvoice && (
              <View ref={printRef} className="p-4">
                <View className="flex-row justify-between items-center mb-6">
                  <View className="flex-col pt-1">
                    <CustomText weight="bold" className="text-xl">
                      {isVatRegistered
                        ? t("print.taxInvoice")
                        : t("print.receipt")}
                    </CustomText>
                    <View className="flex-row">
                      <CustomText weight="regular" className="text-xl">
                        #
                      </CustomText>
                      <CustomText weight="regular" className="text-base">
                        {selectedInvoice.billId}
                      </CustomText>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={closeInvoiceModalAndRefresh} // Use centralized function
                    className="p-2"
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={theme === "dark" ? "#ffffff" : "#000000"}
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex-row justify-between mb-6">
                  <View style={{ maxWidth: "50%" }}>
                    <CustomText weight="bold" className="mb-1">
                      {t("print.billedTo")}
                    </CustomText>
                    <View className="flex-row gap-1">
                      <CustomText>{selectedInvoice.cName}</CustomText>
                      <CustomText>{selectedInvoice.cLastName}</CustomText>
                    </View>
                    <CustomText>{selectedInvoice.cPhone}</CustomText>
                    <CustomText
                      numberOfLines={3}
                      ellipsizeMode="tail"
                      style={{ flexWrap: "wrap" }}
                    >
                      {selectedInvoice.cAddress}
                    </CustomText>
                    <View className="flex-row gap-1">
                      <CustomText>{selectedInvoice.cProvince}</CustomText>
                      <CustomText>{selectedInvoice.cPostId}</CustomText>
                    </View>
                  </View>
                  <View className="items-end">
                    <CustomText weight="bold" className="mb-1">
                      {t("print.invoiceDate")}
                    </CustomText>
                    <CustomText>
                      {formatDate(selectedInvoice.purchaseAt)}
                    </CustomText>

                    <CustomText weight="bold" className="mb-1 mt-2">
                      {t("print.paymentMethod")}
                    </CustomText>
                    <CustomText>{selectedInvoice.payment}</CustomText>

                    <CustomText weight="bold" className="mb-1 mt-2">
                      {t("print.status")}
                    </CustomText>
                    <View
                      className={`p-1 px-2 rounded-full ${
                        selectedInvoice.cashStatus
                          ? "bg-green-700"
                          : "bg-orange-700"
                      }`}
                    >
                      <CustomText style={{ color: "white", fontSize: 12 }}>
                        {selectedInvoice.cashStatus
                          ? t("bill.status.paid")
                          : t("bill.status.unpaid")}
                      </CustomText>
                    </View>
                  </View>
                </View>

                <View className="mb-2">
                  <View className="flex-row justify-between items-center pb-2 mb-2 border-b border-zinc-300">
                    <CustomText weight="bold" style={{ width: "38%" }}>
                      {t("print.productName")}
                    </CustomText>
                    <CustomText
                      weight="bold"
                      style={{ width: "22%", textAlign: "center" }}
                    >
                      {t("print.quantity")}
                    </CustomText>
                    <CustomText
                      weight="bold"
                      style={{ width: "20%", textAlign: "right" }}
                    >
                      {t("print.price")}
                    </CustomText>
                    <CustomText
                      weight="bold"
                      style={{ width: "20%", textAlign: "right" }}
                    >
                      {t("print.total")}
                    </CustomText>
                  </View>

                  {/* Product item rows for multi-product */}
                  {Array.isArray(selectedInvoice.product) &&
                  selectedInvoice.product.length > 0 ? (
                    selectedInvoice.product.map((item: any, idx: number) => (
                      <View
                        key={idx}
                        className="flex-row justify-between items-center py-2"
                      >
                        <CustomText style={{ width: "38%" }}>
                          {item.product}
                        </CustomText>
                        <CustomText
                          style={{ width: "22%", textAlign: "center" }}
                        >
                          {item.quantity}
                          {/* {item.unit ? t(`product.unit.${item.unit}`) || item.unit : t("common.pcs")} */}
                        </CustomText>
                        <CustomText
                          style={{ width: "20%", textAlign: "right" }}
                        >
                          {item.unitPrice}
                        </CustomText>
                        <CustomText
                          style={{ width: "20%", textAlign: "right" }}
                        >
                          {item.unitPrice * item.quantity}
                        </CustomText>
                      </View>
                    ))
                  ) : (
                    <View className="flex-row justify-between items-center py-2">
                      <CustomText style={{ width: "38%" }}>
                        {selectedInvoice.product}
                      </CustomText>
                      <CustomText style={{ width: "22%", textAlign: "center" }}>
                        {selectedInvoice.amount}
                      </CustomText>
                      <CustomText style={{ width: "20%", textAlign: "right" }}>
                        {formatCurrency(calculateInvoiceTotal(selectedInvoice))}
                      </CustomText>
                      <CustomText style={{ width: "20%", textAlign: "right" }}>
                        {formatCurrency(calculateInvoiceTotal(selectedInvoice))}
                      </CustomText>
                    </View>
                  )}
                </View>

                <View className="flex-row justify-end mt-2">
                  <View className="w-2/3">
                    {/* Show discount if any discounts exist */}
                    {(selectedInvoice.discount > 0 || selectedInvoice.billLevelDiscount > 0) && (
                      <View className="flex-row justify-between mb-2">
                        <CustomText weight="bold">
                          {t("print.totalDiscount")}
                        </CustomText>
                        <CustomText>
                          {formatCurrency((selectedInvoice.discount || 0) + (selectedInvoice.billLevelDiscount || 0))}
                        </CustomText>
                      </View>
                    )}
                    {isVatRegistered && (
                      <View className="flex-row justify-between mb-2">
                        <CustomText weight="bold">
                          {t("print.subtotal")}
                        </CustomText>
                        <CustomText>
                          {formatCurrency(calculateInvoiceTotal(selectedInvoice))}
                        </CustomText>
                      </View>
                    )}
                    {isVatRegistered && (
                      <View className="flex-row justify-between mb-2">
                        <View className="flex-row">
                          <CustomText weight="bold">
                            {t("print.tax")}
                          </CustomText>
                          <CustomText weight="bold"> (7%)</CustomText>
                        </View>

                        <CustomText>
                          {formatCurrency(calculateInvoiceTotal(selectedInvoice) * 0.07)}
                        </CustomText>
                      </View>
                    )}
                    <View className="flex-row justify-between mb-2">
                      <CustomText weight="bold">
                        {t("print.grandTotal")}
                      </CustomText>
                      <CustomText weight="bold">
                        {isVatRegistered
                          ? formatCurrency(calculateInvoiceTotal(selectedInvoice) * 1.07)
                          : formatCurrency(calculateInvoiceTotal(selectedInvoice))}
                      </CustomText>
                    </View>
                  </View>
                </View>
                </View>
            )}

            {/* Print Options Progression UI */}
            <View
              style={{
                backgroundColor: "transparent",
                borderRadius: 15,
                padding: 5,
                marginVertical: 2,
                borderWidth: 0,
                borderColor: "transparent",
              }}
            >
              {/* Progress Line Container */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  paddingVertical: 8,
                }}
              >
                {getAvailablePrintSteps().map((step, index) => {
                  const stepConfig = {
                    QA: {
                      icon: "document-text-outline",
                      label: t("print.printQuotation"),
                      type: "Quotation",
                      onPress: () => {
                        handlePrintQuotation();
                      },
                    },
                    IV: {
                      icon: "receipt-outline",
                      label: t("print.printInvoice"),
                      type: "Invoice",
                      onPress: () => {
                        handlePrintInvoice();
                      },
                    },
                    RE: {
                      icon: "checkmark-circle-outline",
                      label: isVatRegistered ? t("print.printTaxInvoice") : t("print.printReceipt"),
                      type: "Receipt",
                      onPress: () => {
                        handlePrintReceipt();
                      },
                    },
                  };

                  const availableSteps = getAvailablePrintSteps();
                  const isLastStep = index === availableSteps.length - 1;
                  const isStepActive = isPrintStepCompleted(step);

                  return (
                    <React.Fragment key={step}>
                      {/* Step Circle */}
                      <TouchableOpacity
                        style={{
                          alignItems: "center",
                          backgroundColor: "transparent",
                        }}
                        onPress={isStepActive ? stepConfig[step].onPress : undefined}
                        activeOpacity={isStepActive ? 0.7 : 1}
                        disabled={!isStepActive}
                      >
                        <View
                          style={{
                            width: 45,
                            height: 45,
                            borderRadius: 22.5,
                            backgroundColor: getPrintStepBackgroundColor(step),
                            borderWidth: 3,
                            borderColor: getPrintStepBorderColor(step),
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: getPrintStepOpacity(step),
                            shadowColor: isPrintStepCompleted(step) ? "#04ecc1" : "transparent",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: isPrintStepCompleted(step) ? 0.6 : 0,
                            shadowRadius: isPrintStepCompleted(step) ? 8 : 0,
                            elevation: isPrintStepCompleted(step) ? 8 : 0,
                          }}
                        >
                          <Ionicons
                            name={stepConfig[step].icon as any}
                            size={20}
                            color={getPrintStepIconColor(step)}
                          />
                        </View>
                        <CustomText
                          style={{
                            fontSize: 9,
                            color: getPrintStepDescriptionColor(step),
                            textAlign: "center",
                            marginTop: 4,
                            fontWeight: "500",
                          }}
                        >
                          {stepConfig[step].label}
                        </CustomText>
                      </TouchableOpacity>

                      {/* Connection Line - Only show if not last step */}
                      {!isLastStep && (
                        <View
                          style={{
                            width: 30,
                            height: 3,
                            marginHorizontal: 6,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingHorizontal: 2,
                          }}
                        >
                          {[...Array(3)].map((_, dotIndex) => (
                            <View
                              key={dotIndex}
                              style={{
                                width: 3,
                                height: 3,
                                borderRadius: 1.5,
                                backgroundColor:
                                  index < availableSteps.findIndex((s) => s === selectedPrintType)
                                    ? "#04ecc1"
                                    : theme === "dark"
                                    ? "#444"
                                    : "#ddd",
                              }}
                            />
                          ))}
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </Modal>

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
                    <View className="flex-row flex-wrap mb-6">
                      <View
                        className={`w-1/2 p-4 ${
                          isMobile() ? "w-full" : "w-1/2 pr-2"
                        } mb-4`}
                      >
                        <View
                          style={{
                            backgroundColor:
                              theme === "dark" ? "#2D2D2D" : "#e1e1e1",
                          }}
                          className="p-4 rounded-lg"
                        >
                          <CustomText className=" mb-1">
                            {t("print.totalSales")}
                          </CustomText>
                          <CustomText weight="bold" className="text-xl">
                            {formatCurrency(monthlyTotals.totalSales)}
                          </CustomText>
                        </View>
                      </View>

                      <View
                        className={`w-1/2 p-4 ${
                          isMobile() ? "w-full" : "w-1/2 pl-2"
                        } mb-4`}
                      >
                        <View
                          style={{
                            backgroundColor:
                              theme === "dark" ? "#2D2D2D" : "#e1e1e1",
                          }}
                          className="p-4 rounded-lg"
                        >
                          <CustomText className=" mb-1">
                            {t("print.totalUnpaidSales")}
                          </CustomText>
                          <CustomText weight="bold" className="text-xl">
                            {formatCurrency(monthlyTotals.totalUnpaidSales)}
                          </CustomText>
                        </View>
                      </View>

                      <View
                        className={`w-1/2 p-4 ${
                          isMobile() ? "w-full" : "w-1/2 pr-2"
                        } mb-4`}
                      >
                        <View
                          style={{
                            backgroundColor:
                              theme === "dark" ? "#2D2D2D" : "#e1e1e1",
                          }}
                          className="p-4 rounded-lg"
                        >
                          <CustomText className=" mb-1">
                            {t("print.totalOrders")}
                          </CustomText>
                          <CustomText weight="bold" className="text-xl">
                            {monthlyTotals.totalOrders}
                          </CustomText>
                        </View>
                      </View>

                      <View
                        className={`w-1/2 p-4 ${
                          isMobile() ? "w-full" : "w-1/3 pr-2"
                        } mb-4`}
                      >
                        <View
                          style={{
                            backgroundColor:
                              theme === "dark" ? "#2D2D2D" : "#e1e1e1",
                          }}
                          className="p-4 rounded-lg"
                        >
                          <CustomText className="mb-1">
                            {t("print.paidOrders")}
                          </CustomText>
                          <View className="flex-row items-center">
                            <CustomText weight="bold" className="text-xl">
                              {monthlyTotals.paidOrders}
                            </CustomText>
                            <View className="ml-2 p-1 px-2 rounded-full bg-green-700">
                              <CustomText
                                className="text-white text-xs"
                                style={{ color: "white", fontSize: 10 }}
                              >
                                {monthlyTotals.totalOrders > 0
                                  ? `${Math.round(
                                      (monthlyTotals.paidOrders /
                                        monthlyTotals.totalOrders) *
                                        100
                                    )}%`
                                  : "0%"}
                              </CustomText>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View
                        className={`w-1/2 p-4 ${
                          isMobile() ? "w-full" : "w-1/3 px-1"
                        } mb-4`}
                      >
                        <View
                          style={{
                            backgroundColor:
                              theme === "dark" ? "#2D2D2D" : "#e1e1e1",
                          }}
                          className="p-4 rounded-lg"
                        >
                          <CustomText className=" mb-1">
                            {t("print.unpaidOrders")}
                          </CustomText>
                          <View className="flex-row items-center">
                            <CustomText weight="bold" className="text-xl">
                              {monthlyTotals.unpaidOrders}
                            </CustomText>
                            <View className="ml-2 p-1 px-2 rounded-full bg-orange-700">
                              <CustomText
                                className="text-white text-xs"
                                style={{ color: "white", fontSize: 10 }}
                              >
                                {monthlyTotals.totalOrders > 0
                                  ? `${Math.round(
                                      (monthlyTotals.unpaidOrders /
                                        monthlyTotals.totalOrders) *
                                        100
                                    )}%`
                                  : "0%"}
                              </CustomText>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View
                        className={`w-1/2 p-4 ${
                          isMobile() ? "w-full" : "w-1/3 pl-2"
                        } mb-4`}
                      >
                        <View
                          style={{
                            backgroundColor:
                              theme === "dark" ? "#2D2D2D" : "#e1e1e1",
                          }}
                          className="p-4 rounded-lg"
                        >
                          <CustomText className=" mb-1">
                            {t("print.avgOrderValue")}
                          </CustomText>
                          <CustomText weight="bold" className="text-xl">
                            {formatCurrency(monthlyTotals.averageOrderValue)}
                          </CustomText>
                        </View>
                      </View>
                    </View>

                    {/* Monthly Invoices */}
                    <View className="flex-row">
                      <CustomText weight="bold" className="mb-4 text-lg">
                        {isVatRegistered
                          ? t("print.monthlyTaxInvoices")
                          : t("print.monthlyReceipts")}
                      </CustomText>

                      <CustomText weight="bold" className="mb-4 text-lg ml-2">
                        {bills.length}
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
                          label: t("print.billId"),
                          value: SEARCH_TYPES.BILL_ID,
                        },
                        {
                          label: t("print.dateRange"),
                          value: SEARCH_TYPES.DATE_RANGE,
                        },
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
                            : t("print.enterBillId")
                        }
                        value={searchQuery}
                        handleChangeText={setSearchQuery}
                        placeholder={
                          searchType === SEARCH_TYPES.CUSTOMER_NAME
                            ? t("bill.enterName")
                            : "INV2025/123 or 2025/123 or 123"
                        }
                        bgColor={theme === "dark" ? "#2D2D2D" : "#e1e1e1"}
                        placeholderTextColor={
                          theme === "dark" ? "#606060" : "#b1b1b1"
                        }
                        textcolor={theme === "dark" ? "#b1b1b1" : "#606060"}
                        keyboardType={
                          searchType === SEARCH_TYPES.BILL_ID
                            ? "numeric"
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
                      containerStyles={isMobile() ? "" : "mt-6"}
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
                                  dateRange[dateRange.length - 1]
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
    </SafeAreaView>
  );
}
