import React, { useState, useEffect, useRef } from "react";
import {
  View,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  Share,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { useBackgroundColorClass } from "@/utils/themeUtils";
import { CustomText } from "@/components/CustomText";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import FormField2 from "@/components/FormField2";
import Dropdown2 from "@/components/Dropdown2";
import CustomButton from "@/components/CustomButton";
import CustomAlert from "@/components/CustomAlert";
import CallAPIPrint from "@/api/print_api";
import { getMemberId, getBusinessId } from "@/utils/utility";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import MultiDateCalendar from "@/components/MultiDateCalendar";
import { isMobile } from "@/utils/responsive";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as ExpoPrint from "expo-print";
import { useBusiness } from "@/providers/BusinessProvider";
import CallAPIBusiness from "@/api/business_api";

// Constants for search types and tab indices
const SEARCH_TYPES = {
  CUSTOMER_NAME: "customer",
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

export default function Print() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { businessName } = useBusiness();
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
  const [monthlyTotals, setMonthlyTotals] = useState({
    totalSales: 0,
    totalOrders: 0,
    paidOrders: 0,
    unpaidOrders: 0,
    averageOrderValue: 0,
  });

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
          console.log("Business Details:", response);
        }
      } catch (error) {
        console.error("Error fetching business details:", error);
      }
    };

    fetchBusinessDetails();
  }, [memberId]);

  // Handle date range selection for the calendar
  const handleDatesChange = (dates: string[]) => {
    setDateRange(dates);
    setCalendarVisible(false);

    // If dates were selected, search with those dates
    if (dates && dates.length > 0) {
      searchByDateRange(dates);
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
          (sum: number, bill: any) =>
            sum + Number(bill.price) * Number(bill.amount),
          0
        );

        const paidOrders = response.filter(
          (bill: any) => bill.cashStatus
        ).length;
        const unpaidOrders = response.length - paidOrders;

        setMonthlyTotals({
          totalSales,
          totalOrders: response.length,
          paidOrders,
          unpaidOrders,
          averageOrderValue: totalSales / response.length,
        });
      } else {
        setMonthlyTotals({
          totalSales: 0,
          totalOrders: 0,
          paidOrders: 0,
          unpaidOrders: 0,
          averageOrderValue: 0,
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
      const response = await CallAPIPrint.getBillByIdAPI(Number(searchQuery));

      if (response.error) {
        throw new Error(response.error);
      }

      // If it belongs to this member, add it to the list
      if (response && response.memberId === memberId) {
        setBills([response]);
      } else {
        setBills([]);
        setAlertConfig({
          visible: true,
          title: t("print.noResults"),
          message: t("print.noBillFound"),
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

  // Handle print action
  const handlePrint = () => {
    if (Platform.OS === "web") {
      // Use HTML content for web/desktop printing
      printHTMLContent();
    } else if (isMobile()) {
      // Show options for mobile: "Save as PDF" or "Cancel"
      setAlertConfig({
        visible: true,
        title: t("print.mobileOptions"),
        message: t("print.saveAsPdfOption"),
        buttons: [
          {
            text: t("print.saveAsPdf"),
            onPress: () => {
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              saveToPDF();
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

  // Function to print HTML content for web/desktop
  const printHTMLContent = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${t("print.salesTaxSummary")} - ${formatMonthYear(selectedMonth, t)}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              padding: 0; 
              font-size: 12px;
              line-height: 1.4;
            }
            .container { 
              max-width: 800px; 
              margin: 0 auto; 
            }
            h1 { 
              font-size: 24px; 
              margin-bottom: 10px; 
              text-align: center;
              color: #333;
            }
            h2 { 
              font-size: 18px; 
              margin-bottom: 15px; 
              text-align: center;
              color: #555;
            }
            h3 { 
              font-size: 16px; 
              margin-bottom: 10px; 
              color: #333;
              border-bottom: 2px solid #0891b2;
              padding-bottom: 5px;
            }
            p { 
              font-size: 12px; 
              line-height: 1.6; 
              margin: 5px 0; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0; 
              font-size: 11px;
            }
            th, td { 
              padding: 8px; 
              text-align: left; 
              border: 1px solid #ddd; 
            }
            th { 
              background-color: #0891b2; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .summary-card {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              background-color: #f8f9fa;
            }
            .summary-card .label {
              font-size: 11px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-card .value {
              font-size: 16px;
              font-weight: bold;
              color: #333;
            }
            .company-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .footer { 
              margin-top: 30px;
              text-align: center; 
              font-size: 10px; 
              color: #888; 
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .status-paid { 
              color: #059669; 
              font-weight: bold; 
            }
            .status-unpaid { 
              color: #dc2626; 
              font-weight: bold; 
            }
            .no-data {
              text-align: center;
              color: #666;
              font-style: italic;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${t("print.salesTaxSummary")}</h1>
            <h2>${t("print.monthlyReport")} ${formatMonthYear(selectedMonth, t)}</h2>

            <div class="company-info">
              <h3>${t("print.companyInformation")}</h3>
              <p><strong>${t("print.companyName")}:</strong> ${businessDetails?.businessName || businessName || "Your Business Name"}</p>
              <p><strong>${t("print.address")}:</strong> ${businessDetails?.businessAddress || "Not specified"}</p>
              <p><strong>${t("print.taxId")}:</strong> ${businessDetails?.vatId || "Not specified"}</p>
            </div>

            <h3>${t("print.monthlySummary")}</h3>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="label">${t("print.totalSales")}</div>
                <div class="value">${formatCurrencyForPDF(monthlyTotals.totalSales)}</div>
              </div>
              <div class="summary-card">
                <div class="label">${t("print.totalOrders")}</div>
                <div class="value">${monthlyTotals.totalOrders}</div>
              </div>
              <div class="summary-card">
                <div class="label">${t("print.paidOrders")}</div>
                <div class="value">${monthlyTotals.paidOrders} (${monthlyTotals.totalOrders > 0 ? Math.round((monthlyTotals.paidOrders / monthlyTotals.totalOrders) * 100) : 0}%)</div>
              </div>
              <div class="summary-card">
                <div class="label">${t("print.unpaidOrders")}</div>
                <div class="value">${monthlyTotals.unpaidOrders} (${monthlyTotals.totalOrders > 0 ? Math.round((monthlyTotals.unpaidOrders / monthlyTotals.totalOrders) * 100) : 0}%)</div>
              </div>
              <div class="summary-card">
                <div class="label">${t("print.avgOrderValue")}</div>
                <div class="value">${formatCurrencyForPDF(monthlyTotals.averageOrderValue)}</div>
              </div>
              <div class="summary-card">
                <div class="label">${t("print.vatAmount")} (7%)</div>
                <div class="value">${formatCurrencyForPDF(monthlyTotals.totalSales * 0.07)}</div>
              </div>
            </div>

            <h3>${t("print.invoiceList")}</h3>
            ${bills.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>${t("print.date")}</th>
                    <th>${t("print.invoiceNo")}</th>
                    <th>${t("print.customer")}</th>
                    <th>${t("print.status")}</th>
                    <th class="text-right">${t("print.price")}</th>
                    <th class="text-right">VAT (7%)</th>
                    <th class="text-right">${t("print.total")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${bills.map((bill, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${formatDate(bill.purchaseAt)}</td>
                      <td>#${bill.id}</td>
                      <td>${bill.cName || ''} ${bill.cLastName || ''}</td>
                      <td class="${bill.cashStatus ? 'status-paid' : 'status-unpaid'}">
                        ${bill.cashStatus ? t("print.paid") : t("print.unpaid")}
                      </td>
                      <td class="text-right">${formatCurrencyForPDF(bill.price)}</td>
                      <td class="text-right">${formatCurrencyForPDF(bill.price * bill.amount * 0.07)}</td>
                      <td class="text-right">${formatCurrencyForPDF((bill.price * bill.amount)+(bill.price * bill.amount * 0.07))}</td>
                    </tr>
                  `).join('')}
                  <tr style="background-color: #e5e7eb; font-weight: bold;">
                    <td colspan="5" class="text-right bold">${t("print.total")}</td>
                    <td class="text-right bold">${formatCurrencyForPDF(bills.reduce((sum, bill) => sum + bill.price, 0))}</td>
                    <td class="text-right bold">${formatCurrencyForPDF(bills.reduce((sum, bill) => sum + (bill.price * bill.amount * 0.07), 0))}</td>
                    <td class="text-right bold">${formatCurrencyForPDF(bills.reduce((sum, bill) => sum + (bill.price * bill.amount)+(bill.price * bill.amount * 0.07), 0))}</td>
                  </tr>
                </tbody>
              </table>
            ` : `
              <div class="no-data">
                ${t("print.noInvoicesFound")}
              </div>
            `}

            <div class="footer">
              ${t("print.generatedOn")} ${format(new Date(), "dd/MM/yyyy HH:mm")} - Flexi Business App
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
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
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
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

    const invoice = selectedInvoice;
    const subtotal = invoice.price * invoice.amount;
    const vatAmount = subtotal * 0.07;
    const grandTotal = subtotal + vatAmount;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${t("print.invoice")} #${invoice.id}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              padding: 0; 
              font-size: 14px;
              line-height: 1.6;
              color: #333;
            }
            .container { 
              max-width: 800px; 
              margin: 0 auto; 
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #0891b2;
              padding-bottom: 20px;
            }
            h1 { 
              font-size: 28px; 
              margin-bottom: 5px; 
              color: #0891b2;
            }
            .invoice-number {
              font-size: 18px;
              color: #666;
              margin-bottom: 20px;
            }
            .company-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .company-info h3 {
              margin-top: 0;
              color: #0891b2;
            }
            .billing-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .billing-info {
              flex: 1;
            }
            .billing-info h4 {
              color: #0891b2;
              margin-bottom: 10px;
            }
            .invoice-details {
              text-align: right;
              flex: 1;
            }
            .status-paid {
              background-color: #059669;
              color: white;
              padding: 5px 10px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-unpaid {
              background-color: #dc2626;
              color: white;
              padding: 5px 10px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0; 
            }
            th, td { 
              padding: 12px; 
              text-align: left; 
              border: 1px solid #ddd; 
            }
            th { 
              background-color: #0891b2; 
              color: white;
              font-weight: bold;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .summary-section {
              margin-top: 30px;
              text-align: right;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              padding: 5px 0;
            }
            .summary-row.total {
              border-top: 2px solid #0891b2;
              font-weight: bold;
              font-size: 16px;
              color: #0891b2;
              margin-top: 15px;
              padding-top: 15px;
            }
            .footer { 
              margin-top: 50px;
              text-align: center; 
              font-size: 12px; 
              color: #888; 
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .thank-you {
              text-align: center;
              margin-top: 40px;
              font-style: italic;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${t("print.invoice")}</h1>
              <div class="invoice-number">#${invoice.id}</div>
            </div>

            <div class="company-info">
              <h3>${t("print.companyInformation")}</h3>
              <p><strong>${t("print.companyName")}:</strong> ${businessDetails?.businessName || businessName || "Your Business Name"}</p>
              <p><strong>${t("print.address")}:</strong> ${businessDetails?.businessAddress || "Not specified"}</p>
              <p><strong>${t("print.taxId")}:</strong> ${businessDetails?.vatId || "Not specified"}</p>
            </div>

            <div class="billing-section">
              <div class="billing-info">
                <h4>${t("print.billedTo")}:</h4>
                <p><strong>${invoice.cName} ${invoice.cLastName}</strong></p>
                <p>${invoice.cPhone || ''}</p>
                <p>${invoice.cAddress || ''}</p>
                <p>${invoice.cProvince || ''} ${invoice.cPostId || ''}</p>
              </div>
              
              <div class="invoice-details">
                <p><strong>${t("print.invoiceDate")}:</strong> ${formatDate(invoice.purchaseAt)}</p>
                <p><strong>${t("print.paymentMethod")}:</strong> ${invoice.payment}</p>
                <p><strong>${t("print.status")}:</strong> 
                  <span class="${invoice.cashStatus ? 'status-paid' : 'status-unpaid'}">
                    ${invoice.cashStatus ? t("print.paid") : t("print.unpaid")}
                  </span>
                </p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>${t("print.productName")}</th>
                  <th class="text-center">${t("print.quantity")}</th>
                  <th class="text-right">${t("print.price")}</th>
                  <th class="text-right">${t("print.total")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${invoice.product}</td>
                  <td class="text-center">${invoice.amount}</td>
                  <td class="text-right">${formatCurrencyForPDF(invoice.price)}</td>
                  <td class="text-right">${formatCurrencyForPDF(subtotal)}</td>
                </tr>
              </tbody>
            </table>

            <div class="summary-section">
              <div class="summary-row">
                <span>${t("print.subtotal")}:</span>
                <span>${formatCurrencyForPDF(subtotal)}</span>
              </div>
              <div class="summary-row">
                <span>${t("print.tax")} (7%):</span>
                <span>${formatCurrencyForPDF(vatAmount)}</span>
              </div>
              <div class="summary-row total">
                <span>${t("print.grandTotal")}:</span>
                <span>${formatCurrencyForPDF(grandTotal)}</span>
              </div>
            </div>

            <div class="thank-you">
              <p>${t("print.thankYou")}</p>
            </div>

            <div class="footer">
              ${t("print.generatedOn")} ${format(new Date(), "dd/MM/yyyy HH:mm")} - Flexi Business Hub
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
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
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoice.id}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Function to handle saving content as PDF
  const saveToPDF = async () => {
    // Close the initial alert
    setAlertConfig((prev) => ({ ...prev, visible: false }));

    // Show loading indicator
    setAlertConfig({
      visible: true,
      title: t("print.generating"),
      message: t("print.generatingPdf"),
      buttons: [],
    });

    try {
      // Create a function to format currency without THB for mobile PDF
      const formatCurrencyMobile = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      // Create a printable HTML content
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .container { padding: 20px; }
              h1 { font-size: 28px; margin-bottom: 20px; text-align: center; }
              h2 { font-size: 24px; margin-bottom: 15px; text-align: center; }
              h3 { font-size: 20px; margin-bottom: 10px; }
              p { font-size: 16px; line-height: 1.6; margin: 0 0 10px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
              th { background-color: #f2f2f2; font-size: 14px; font-weight: bold; }
              td { font-size: 13px; }
              .invoice-table th { font-size: 14px; }
              .invoice-table td { font-size: 13px; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .bold { font-weight: bold; }
              .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 14px; color: #888; }
              
              /* Summary cards styling */
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin: 15px 0;
              }
              .summary-card {
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 12px;
                background-color: #f8f9fa;
                text-align: center;
              }
              .summary-card .label {
                font-size: 14px;
                color: #666;
                margin-bottom: 5px;
                font-weight: normal;
              }
              .summary-card .value {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                margin: 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>${t("print.salesTaxSummary")}</h1>
              <h2>${t("print.monthlyReport")} ${formatMonthYear(selectedMonth, t)}</h2>

              <h3>${t("print.companyInformation")}</h3>
              <p><strong>${t("print.companyName")}:</strong> ${businessDetails?.businessName || businessName || "Your Business Name"}</p>
              <p>${t("print.address")}: ${businessDetails?.businessAddress || "Not specified"}</p>
              <p>${t("print.taxId")}: ${businessDetails?.vatId || "Not specified"}</p>

              <h3>${t("print.monthlySummary")}</h3>
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="label">${t("print.totalSales")}</div>
                  <div class="value">${formatCurrencyMobile(monthlyTotals.totalSales)}</div>
                </div>
                <div class="summary-card">
                  <div class="label">${t("print.totalOrders")}</div>
                  <div class="value">${monthlyTotals.totalOrders}</div>
                </div>
                <div class="summary-card">
                  <div class="label">${t("print.paidOrders")}</div>
                  <div class="value">${monthlyTotals.paidOrders} (${
        monthlyTotals.totalOrders > 0
          ? Math.round(
              (monthlyTotals.paidOrders / monthlyTotals.totalOrders) * 100
            )
          : 0
      }%)</div>
                </div>
                <div class="summary-card">
                  <div class="label">${t("print.unpaidOrders")}</div>
                  <div class="value">${monthlyTotals.unpaidOrders} (${
        monthlyTotals.totalOrders > 0
          ? Math.round(
              (monthlyTotals.unpaidOrders / monthlyTotals.totalOrders) * 100
            )
          : 0
      }%)</div>
                </div>
                <div class="summary-card">
                  <div class="label">${t("print.avgOrderValue")}</div>
                  <div class="value">${formatCurrencyMobile(monthlyTotals.averageOrderValue)}</div>
                </div>
                <div class="summary-card">
                  <div class="label">${t("print.taxAmount")} (7%)</div>
                  <div class="value">${formatCurrencyMobile(monthlyTotals.totalSales * 0.07)}</div>
                </div>
              </div>

              <h3>${t("print.invoiceList")}</h3>
              <table class="invoice-table">
                <tr>
                  <th>#</th>
                  <th>${t("print.date")}</th>
                  <th>${t("print.invoiceNo")}</th>
                  <th>${t("print.customer")}</th>
                  <th>${t("print.status")}</th>
                  <th>${t("print.price")}</th>
                  <th>VAT (7%)</th>
                  <th>${t("print.total")}</th>
                </tr>
                ${bills
                  .map(
                    (bill, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${formatDate(bill.purchaseAt)}</td>
                    <td>#${bill.id}</td>
                    <td>${bill.cName} ${bill.cLastName}</td>
                    <td>${
                      bill.cashStatus
                        ? t("print.paid")
                        : t("print.unpaid")
                    }</td>
                    <td class="text-right">${formatCurrencyMobile(bill.price)}</td>
                    <td class="text-right">${formatCurrencyMobile(
                      bill.price * bill.amount * 0.07
                    )}</td>
                    <td class="text-right">${formatCurrencyMobile(
                      (bill.price * bill.amount)+(bill.price * bill.amount * 0.07)
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr style="background-color: #e5e7eb; font-weight: bold;">
                  <td colspan="5" class="text-right bold">${t("print.total")}</td>
                  <td class="text-right bold">${formatCurrencyMobile(bills.reduce((sum, bill) => sum + bill.price, 0))}</td>
                  <td class="text-right bold">${formatCurrencyMobile(bills.reduce((sum, bill) => sum + (bill.price * bill.amount * 0.07), 0))}</td>
                  <td class="text-right bold">${formatCurrencyMobile(bills.reduce((sum, bill) => sum + (bill.price * bill.amount)+(bill.price * bill.amount * 0.07), 0))}</td>
                </tr>
              </table>

              <div class="footer">
                ${t("print.generatedOn")} ${format(
                  new Date(),
                  "dd/MM/yyyy HH:mm"
                )} - ${t("print.page")} 1 - Flexi Business App
              </div>
            </div>
          </body>
        </html>
      `;

      // Print the document
      await ExpoPrint.printAsync({
        html: htmlContent,
        // options: {
        //   // Add any specific options for printing here
        // },
      });

      // Hide loading indicator
      setAlertConfig((prev) => ({ ...prev, visible: false }));
    } catch (error) {
      console.error("Error generating PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfGenerationError")}: ${
          (error as Error).message
        }`,
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

    // Close the initial alert
    setAlertConfig((prev) => ({ ...prev, visible: false }));

    // Show loading indicator
    setAlertConfig({
      visible: true,
      title: t("print.generating"),
      message: t("print.generatingPdf"),
      buttons: [],
    });

    try {
      const invoice = selectedInvoice;
      const subtotal = invoice.price * invoice.amount;
      const vatAmount = subtotal * 0.07;
      const grandTotal = subtotal + vatAmount;

      // Create a function to format currency without THB for mobile PDF
      const formatCurrencyMobile = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "decimal",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      };

      // Create a printable HTML content for individual invoice
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .container { padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0891b2; padding-bottom: 20px; }
              h1 { font-size: 32px; margin-bottom: 10px; color: #0891b2; }
              .invoice-number { font-size: 20px; color: #666; margin-bottom: 20px; }
              h3 { font-size: 22px; margin-bottom: 15px; color: #0891b2; }
              p { font-size: 16px; line-height: 1.6; margin: 0 0 10px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
              th { background-color: #0891b2; color: white; font-size: 16px; font-weight: bold; }
              td { font-size: 15px; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .billing-section { margin: 30px 0; }
              .company-info { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
              .invoice-details { margin: 20px 0; }
              .status-paid { background-color: #059669; color: white; padding: 5px 10px; border-radius: 15px; font-size: 14px; font-weight: bold; }
              .status-unpaid { background-color: #dc2626; color: white; padding: 5px 10px; border-radius: 15px; font-size: 14px; font-weight: bold; }
              .summary-section { margin-top: 30px; }
              .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 8px 0; font-size: 16px; }
              .summary-row.total { border-top: 2px solid #0891b2; font-weight: bold; font-size: 18px; color: #0891b2; margin-top: 15px; padding-top: 15px; }
              .thank-you { text-align: center; margin-top: 40px; font-style: italic; color: #666; font-size: 16px; }
              .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 14px; color: #888; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${t("print.invoice")}</h1>
                <div class="invoice-number">#${invoice.id}</div>
              </div>

              <div class="company-info">
                <h3>${t("print.companyInformation")}</h3>
                <p><strong>${t("print.companyName")}:</strong> ${businessDetails?.businessName || businessName || "Your Business Name"}</p>
                <p><strong>${t("print.address")}:</strong> ${businessDetails?.businessAddress || "Not specified"}</p>
                <p><strong>${t("print.taxId")}:</strong> ${businessDetails?.vatId || "Not specified"}</p>
              </div>

              <div class="billing-section">
                <h3>${t("print.billedTo")}:</h3>
                <p><strong>${invoice.cName} ${invoice.cLastName}</strong></p>
                <p>${invoice.cPhone || ''}</p>
                <p>${invoice.cAddress || ''}</p>
                <p>${invoice.cProvince || ''} ${invoice.cPostId || ''}</p>
              </div>
              
              <div class="invoice-details">
                <p><strong>${t("print.invoiceDate")}:</strong> ${formatDate(invoice.purchaseAt)}</p>
                <p><strong>${t("print.paymentMethod")}:</strong> ${invoice.payment}</p>
                <p><strong>${t("print.status")}:</strong> 
                  <span class="${invoice.cashStatus ? 'status-paid' : 'status-unpaid'}">
                    ${invoice.cashStatus ? t("print.paid") : t("print.unpaid")}
                  </span>
                </p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>${t("print.productName")}</th>
                    <th class="text-center">${t("print.quantity")}</th>
                    <th class="text-right">${t("print.price")}</th>
                    <th class="text-right">${t("print.total")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${invoice.product}</td>
                    <td class="text-center">${invoice.amount}</td>
                    <td class="text-right">${formatCurrencyForPDF(invoice.price)}</td>
                    <td class="text-right">${formatCurrencyForPDF(subtotal)}</td>
                  </tr>
                </tbody>
              </table>

              <div class="summary-section">
                <div class="summary-row">
                  <span>${t("print.subtotal")}:</span>
                  <span>${formatCurrencyForPDF(subtotal)}</span>
                </div>
                <div class="summary-row">
                  <span>${t("print.tax")} (7%):</span>
                  <span>${formatCurrencyForPDF(vatAmount)}</span>
                </div>
                <div class="summary-row total">
                  <span>${t("print.grandTotal")}:</span>
                  <span>${formatCurrencyForPDF(grandTotal)}</span>
                </div>
              </div>

              <div class="thank-you">
                <p>${t("print.thankYou")}</p>
              </div>

              <div class="footer">
                ${t("print.generatedOn")} ${format(new Date(), "dd/MM/yyyy HH:mm")} - Flexi Business App
              </div>
            </div>
          </body>
        </html>
      `;

      // Print the document
      await ExpoPrint.printAsync({
        html: htmlContent,
        // options: {
        //   // Add any specific options for printing here
        // },
      });

      // Hide loading indicator
      setAlertConfig((prev) => ({ ...prev, visible: false }));
    } catch (error) {
      console.error("Error generating individual invoice PDF:", error);
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

  // Function to save PDF to a user-selected location
  const handleSavePdfToLocation = async (filePath: string) => {
    try {
      // On web, trigger a download
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = filePath;
        link.download = `income_report_${format(selectedMonth, "yyyy-MM")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // On mobile, save to documents directory and notify user
        const destDir = FileSystem.documentDirectory;
        const newPath = `${destDir}income_report_${format(
          selectedMonth,
          "yyyy-MM"
        )}.pdf`;

        // Copy file to documents directory
        await FileSystem.copyAsync({
          from: filePath,
          to: newPath,
        });

        setAlertConfig({
          visible: true,
          title: t("print.success"),
          message: t("print.pdfSavedMessage") + `\n${newPath}`,
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
      console.error("Error saving PDF:", error);
      setAlertConfig({
        visible: true,
        title: t("print.error"),
        message: `${t("print.pdfSavingError")}: ${(error as Error).message}`,
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
            ? "border-gray-700 bg-zinc-800"
            : "border-gray-200 bg-white"
        }`}
        onPress={() => viewInvoiceDetails(invoice)}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <View className="flex-row">
              <CustomText weight="bold" className="mb-1 text-base">
                {t("print.invoice")}
              </CustomText>
              <CustomText className="mb-1">#</CustomText>
              <CustomText weight="bold" className="mb-1 text-base">
                {invoice.id}
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
              {formatCurrency(invoice.price * invoice.amount)}
            </CustomText>
            <View
              className={`mt-2 p-1 px-2 rounded-full ${
                invoice.cashStatus ? "bg-green-700" : "bg-orange-700"
              }`}
            >
              <CustomText className="text-white text-xs"
              style={{ color: "white", fontSize: 11 }}>
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
        onRequestClose={() => setInvoiceModalVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          activeOpacity={1}
          onPress={() => setInvoiceModalVisible(false)}
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
                  <View className="flex-row">
                    <CustomText weight="bold" className="text-xl">
                      {t("print.invoice")}
                    </CustomText>
                    <CustomText weight="bold" className="text-xl">
                      #
                    </CustomText>
                    <CustomText weight="bold" className="text-xl">
                      {selectedInvoice.id}
                    </CustomText>
                  </View>
                  <TouchableOpacity
                    onPress={() => setInvoiceModalVisible(false)}
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
                  <View>
                    <CustomText weight="bold" className="mb-1">
                      {t("print.billedTo")}
                    </CustomText>
                    <View className="flex-row gap-1">
                      <CustomText>{selectedInvoice.cName}</CustomText>
                      <CustomText>{selectedInvoice.cLastName}</CustomText>
                    </View>
                    <CustomText>{selectedInvoice.cPhone}</CustomText>
                    <CustomText>{selectedInvoice.cAddress}</CustomText>
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
                      <CustomText 
                      style={{ color: "white", fontSize: 12 }}>
                        {selectedInvoice.cashStatus
                          ? t("bill.status.paid")
                          : t("bill.status.unpaid")}
                      </CustomText>
                    </View>
                  </View>
                </View>

                <View className="mb-2">
                  <View className="flex-row justify-between items-center pb-2 mb-2 border-b border-zinc-300">
                    <CustomText weight="bold" style={{ width: '38%' }}>
                      {t("print.productName")}
                    </CustomText>
                    <CustomText weight="bold" style={{ width: '22%', textAlign: 'center' }}>
                      {t("print.quantity")}
                    </CustomText>
                    <CustomText weight="bold" style={{ width: '20%', textAlign: 'right' }}>
                      {t("print.price")}
                    </CustomText>
                    <CustomText weight="bold" style={{ width: '20%', textAlign: 'right' }}>
                      {t("print.total")}
                    </CustomText>
                  </View>
                  
                  {/* Product item row */}
                  <View className="flex-row justify-between items-center py-2">
                    <CustomText style={{ width: '38%' }}>{selectedInvoice.product}</CustomText>
                    <CustomText style={{ width: '22%', textAlign: 'center' }}>{selectedInvoice.amount}</CustomText>
                    <CustomText style={{ width: '20%', textAlign: 'right' }}>
                      {formatCurrency(selectedInvoice.price)}
                    </CustomText>
                    <CustomText style={{ width: '20%', textAlign: 'right' }}>
                      {formatCurrency(
                        selectedInvoice.price * selectedInvoice.amount
                      )}
                    </CustomText>
                  </View>
                </View>

                <View className="flex-row justify-end mt-2">
                  <View className="w-2/3">
                    <View className="flex-row justify-between mb-2">
                      <CustomText weight="bold">
                        {t("print.subtotal")}
                      </CustomText>
                      <CustomText>
                        {formatCurrency(
                          selectedInvoice.price * selectedInvoice.amount
                        )}
                      </CustomText>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <View className="flex-row">
                      <CustomText weight="bold">
                        {t("print.tax")} 
                      </CustomText>
                      <CustomText weight="bold">
                         (7%)
                      </CustomText>
                      </View>
                      
                      <CustomText>
                        {formatCurrency(
                          selectedInvoice.price * selectedInvoice.amount * 0.07
                        )}
                      </CustomText>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <CustomText weight="bold">
                        {t("print.grandTotal")}
                      </CustomText>
                      <CustomText weight="bold">
                        {formatCurrency(
                          selectedInvoice.price * selectedInvoice.amount * 1.07
                        )}
                      </CustomText>
                    </View>
                  </View>
                </View>

                <View className="mt-8 items-center">
                  <CustomText className="text-center text-xs text-zinc-500">
                    {t("print.thankYou")}
                  </CustomText>
                </View>
              </View>
            )}

            <View className="mt-4 flex-row justify-center">
              <CustomButton
                title={t("print.printInvoice")}
                handlePress={handlePrintInvoice}
                containerStyles="px-8"
                textStyles="!text-white"
              />
            </View>
          </View>
        </TouchableOpacity>
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
            <TouchableOpacity
              onPress={handlePrint}
              className={`flex-row items-center ${isMobile() ? "ml-auto" : ""}`}
            >
              <Ionicons
                name="print"
                size={24}
                color={theme === "dark" ? "#ffffff" : "#393838"}
                style={{ marginRight: 8 }}
              />
              {!isMobile() && (
              <CustomText>{t("print.incomeReport")}</CustomText>)}
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View className="flex-row mb-6">
            <TouchableOpacity
              className={`p-3 px-6 rounded-t-lg ${
                activeTab === TAB_INDICES.MONTHLY_REPORT
                  ? theme === 'dark'
                    ? 'bg-zinc-800 border-b-2 border-teal-400'
                    : 'bg-white border-b-2 border-teal-400'
                  : theme === 'dark'
                    ? 'bg-zinc-700'
                    : 'bg-gray-200'
              }`}
              onPress={() => {
                setActiveTab(TAB_INDICES.MONTHLY_REPORT);
                // Automatically fetch the current month's data when switching to Monthly Report tab
                const currentDate = new Date();
                setSelectedMonth(currentDate);
                fetchMonthlyReportData(currentDate);
              }}
            >
              <CustomText 
                weight={activeTab === TAB_INDICES.MONTHLY_REPORT ? "bold" : "regular"}
              >
                {t("print.monthlyReport")}
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-3 px-6 rounded-t-lg ${
                activeTab === TAB_INDICES.INDIVIDUAL_INVOICE
                  ? theme === 'dark'
                    ? "bg-zinc-800 border-b-2 border-teal-400"
                    : "bg-white border-b-2 border-teal-400"
                  : theme === 'dark'
                  ? "bg-zinc-700"
                  : "bg-gray-200"
              }`}
              onPress={() => setActiveTab(TAB_INDICES.INDIVIDUAL_INVOICE)}
            >
              <CustomText
                weight={
                  activeTab === TAB_INDICES.INDIVIDUAL_INVOICE
                    ? "bold"
                    : "regular"
                }
              >
                {t("print.invoiceSearch")}
              </CustomText>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View
            className={`p-4 rounded-lg ${
              theme === "dark" ? "bg-zinc-800" : "bg-white"
            } mb-8`}
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
                    <ActivityIndicator size="large" color="#0feac2" />
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
                          className={`p-4 rounded-lg ${
                            theme === "dark" ? "bg-zinc-700" : "bg-zinc-200"
                          }`}
                        >
                          <CustomText className="text-zinc-500 mb-1">
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
                          className={`p-4 rounded-lg ${
                            theme === "dark" ? "bg-zinc-700" : "bg-zinc-200"
                          }`}
                        >
                          <CustomText className="text-zinc-500 mb-1">
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
                          className={`p-4 rounded-lg ${
                            theme === "dark" ? "bg-zinc-700" : "bg-zinc-200"
                          }`}
                        >
                          <CustomText className="text-zinc-500 mb-1">
                            {t("print.paidOrders")}
                          </CustomText>
                          <View className="flex-row items-center">
                            <CustomText weight="bold" className="text-xl">
                              {monthlyTotals.paidOrders}
                            </CustomText>
                            <View className="ml-2 p-1 px-2 rounded-full bg-green-700">
                              <CustomText className="text-white text-xs"
                              style={{ color: "white", fontSize: 10 }}>
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
                          className={`p-4 rounded-lg ${
                            theme === "dark" ? "bg-zinc-700" : "bg-zinc-200"
                          }`}
                        >
                          <CustomText className="text-zinc-500 mb-1">
                            {t("print.unpaidOrders")}
                          </CustomText>
                          <View className="flex-row items-center">
                            <CustomText weight="bold" className="text-xl">
                              {monthlyTotals.unpaidOrders}
                            </CustomText>
                            <View className="ml-2 p-1 px-2 rounded-full bg-orange-700">
                              <CustomText className="text-white text-xs"
                              style={{ color: "white", fontSize: 10 }}>
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
                          className={`p-4 rounded-lg ${
                            theme === "dark" ? "bg-zinc-700" : "bg-zinc-200"
                          }`}
                        >
                          <CustomText className="text-zinc-500 mb-1">
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
                        {t("print.monthlyInvoices")}
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
                  {t("print.findInvoice")}
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
                      selectedValue={searchType}
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
                            : "123"
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
                    <ActivityIndicator size="large" color="#0feac2" />
                  </View>
                ) : (
                  <>
                    {searchType === SEARCH_TYPES.DATE_RANGE &&
                      dateRange.length > 0 && (
                        <View className="mb-4 p-4 rounded-lg bg-teal-900 bg-opacity-20">
                          <CustomText>
                            {t("print.searchingDateRange")}:{" "}
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
