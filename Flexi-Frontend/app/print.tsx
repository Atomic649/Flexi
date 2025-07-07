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
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PDFFont, RGB } from "pdf-lib";
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
      window.print();
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

  // Function to safely handle text in PDF that might contain Thai characters or be undefined
  const safeText = (text: string | undefined | null): string => {
    // First check if text is undefined or null
    if (text === undefined || text === null) {
      return ""; // Return empty string for undefined or null values
    }

    // Then check for Thai characters
    try {
      // Check if text contains Thai characters
      if (/[\u0E00-\u0E7F]/.test(text)) {
        // For customer names and other Thai text, use a simple fallback
        return "[Thai text]";
      }
      return text;
    } catch (e) {
      console.error("Error processing text:", e);
      return "[Text]";
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
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Embed standard fonts
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

      // Add a page to the document
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();

      // Set margins
      const margin = 40;
      let yPosition = height - margin;
      const lineHeight = 20;

      // Helper function to draw text
      const drawText = (
        text: string,
        x: number,
        y: number,
        options?: {
          size?: number;
          font?: PDFFont;
          color?: RGB;
          align?: "left" | "center" | "right";
        }
      ) => {
        const size = options?.size || 10;
        const font = options?.font || timesRomanFont;
        const color = options?.color || rgb(0, 0, 0);

        if (options?.align === "center") {
          const textWidth = font.widthOfTextAtSize(text, size);
          x = x - textWidth / 2;
        } else if (options?.align === "right") {
          const textWidth = font.widthOfTextAtSize(text, size);
          x = x - textWidth;
        }

        page.drawText(safeText(text), {
          x,
          y,
          size,
          font,
          color,
        });
      };

      // Draw title - Company information section
      drawText(t("print.salesTaxSummary"), width / 2, yPosition, {
        size: 16,
        font: boldFont,
        align: "center",
      });
      yPosition -= lineHeight * 1.5;

      // Month and Year header
      const monthYearText = format(selectedMonth, "MMMM yyyy");
      drawText(
        `${t("print.monthYear")} ${monthYearText}`,
        width / 2,
        yPosition,
        { size: 14, font: boldFont, align: "center" }
      );
      yPosition -= lineHeight * 2;

      // Company Information
      drawText(t("print.companyName"), margin, yPosition, {
        size: 12,
        font: boldFont,
      });

      // Get business name from context or use placeholder
      const businessNameText =
        businessName || businessDetails?.businessName || "Your Business Name";
      drawText(businessNameText, margin + 120, yPosition, { size: 12 });

      // Tax ID on right side
      drawText(t("print.taxId"), width - margin - 200, yPosition, {
        size: 12,
        font: boldFont,
      });
      yPosition -= lineHeight;

      // Company address
      if (businessDetails?.businessAddress) {
        drawText(t("print.address"), margin, yPosition, {
          size: 12,
          font: boldFont,
        });
        drawText(businessDetails.businessAddress, margin + 120, yPosition, {
          size: 12,
        });
      }

      // Business tax ID number
      const taxIdNumber = businessDetails?.vatId || "0000000000000";
      drawText(taxIdNumber, width - margin - 200, yPosition, { size: 12 });
      yPosition -= lineHeight;

      // Add a horizontal line
      page.drawLine({
        start: { x: margin, y: yPosition - 5 },
        end: { x: width - margin, y: yPosition - 5 },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });

      yPosition -= lineHeight * 1.5;

      // Add monthly summary section
      drawText(t("print.monthlySummary"), margin, yPosition, {
        size: 14,
        font: boldFont,
      });
      yPosition -= lineHeight * 1.5;

      // Draw summary statistics in a table format
      const summaryTableWidth = width - margin * 2;
      const col1 = margin;
      const col2 = margin + summaryTableWidth * 0.3;
      const col3 = margin + summaryTableWidth * 0.6;

      // Summary table header - blue background
      page.drawRectangle({
        x: margin,
        y: yPosition - lineHeight,
        width: summaryTableWidth,
        height: lineHeight,
        color: rgb(0.5, 0.57, 0.7), // Similar to the blue in the reference
      });

      // White text headers
      drawText(t("print.description"), col1 + 5, yPosition - lineHeight + 5, {
        size: 11,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      drawText(t("print.amount"), col2 + 5, yPosition - lineHeight + 5, {
        size: 11,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      drawText(t("print.taxAmount"), col3 + 5, yPosition - lineHeight + 5, {
        size: 11,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      yPosition -= lineHeight;

      // Light gray for first summary row
      page.drawRectangle({
        x: margin,
        y: yPosition - lineHeight,
        width: summaryTableWidth,
        height: lineHeight,
        color: rgb(0.95, 0.95, 0.95),
      });

      // Total Sales Data
      drawText(t("print.totalSales"), col1 + 5, yPosition - lineHeight + 5, {
        size: 11,
      });
      drawText(
        formatCurrencyForPDF(monthlyTotals.totalSales),
        col2 + 5,
        yPosition - lineHeight + 5,
        { size: 11 }
      );

      // Calculate tax amount (7% standard VAT in Thailand)
      const taxAmount = monthlyTotals.totalSales * 0.07;
      drawText(
        formatCurrencyForPDF(taxAmount),
        col3 + 5,
        yPosition - lineHeight + 5,
        { size: 11 }
      );

      yPosition -= lineHeight;

      // White for second summary row
      page.drawRectangle({
        x: margin,
        y: yPosition - lineHeight,
        width: summaryTableWidth,
        height: lineHeight,
        color: rgb(1, 1, 1),
      });

      // Total Orders
      drawText(t("print.totalOrders"), col1 + 5, yPosition - lineHeight + 5, {
        size: 11,
      });
      drawText(
        monthlyTotals.totalOrders.toString(),
        col2 + 5,
        yPosition - lineHeight + 5,
        { size: 11 }
      );
      drawText("", col3 + 5, yPosition - lineHeight + 5, { size: 11 });

      yPosition -= lineHeight;

      // Light gray for third summary row
      page.drawRectangle({
        x: margin,
        y: yPosition - lineHeight,
        width: summaryTableWidth,
        height: lineHeight,
        color: rgb(0.95, 0.95, 0.95),
      });

      // Paid orders
      drawText(t("print.paidOrders"), col1 + 5, yPosition - lineHeight + 5, {
        size: 11,
      });
      drawText(
        `${monthlyTotals.paidOrders} (${
          monthlyTotals.totalOrders > 0
            ? Math.round(
                (monthlyTotals.paidOrders / monthlyTotals.totalOrders) * 100
              )
            : 0
        }%)`,
        col2 + 5,
        yPosition - lineHeight + 5,
        { size: 11 }
      );
      drawText("", col3 + 5, yPosition - lineHeight + 5, { size: 11 });

      yPosition -= lineHeight;

      // White for fourth summary row
      page.drawRectangle({
        x: margin,
        y: yPosition - lineHeight,
        width: summaryTableWidth,
        height: lineHeight,
        color: rgb(1, 1, 1),
      });

      // Unpaid orders
      drawText(t("print.unpaidOrders"), col1 + 5, yPosition - lineHeight + 5, {
        size: 11,
      });
      drawText(
        `${monthlyTotals.unpaidOrders} (${
          monthlyTotals.totalOrders > 0
            ? Math.round(
                (monthlyTotals.unpaidOrders / monthlyTotals.totalOrders) * 100
              )
            : 0
        }%)`,
        col2 + 5,
        yPosition - lineHeight + 5,
        { size: 11 }
      );
      drawText("", col3 + 5, yPosition - lineHeight + 5, { size: 11 });

      yPosition -= lineHeight * 2;

      // Add invoices section if there are bills
      if (bills.length > 0) {
        drawText(t("print.invoiceList"), margin, yPosition, {
          size: 14,
          font: boldFont,
        });
        yPosition -= lineHeight * 1.5;

        // Define table columns for invoices
        const tableWidth = width - margin * 2;
        const colWidths = [
          tableWidth * 0.05, // #
          tableWidth * 0.1, // Date
          tableWidth * 0.15, // Invoice No
          tableWidth * 0.25, // Customer
          tableWidth * 0.15, // Status
          tableWidth * 0.15, // Price
          tableWidth * 0.15, // Total with VAT
        ];

        // Calculate column starting positions
        const colStarts: number[] = [];
        let currentX = margin;
        for (let i = 0; i < colWidths.length; i++) {
          colStarts.push(currentX);
          currentX += colWidths[i];
        }

        // Draw table header with blue background
        page.drawRectangle({
          x: margin,
          y: yPosition - lineHeight,
          width: tableWidth,
          height: lineHeight,
          color: rgb(0.5, 0.57, 0.7), // Similar blue color
        });

        // Header text
        const headers = [
          "#",
          t("print.date"),
          t("print.invoiceNo"),
          t("print.customer"),
          t("print.status"),
          t("print.price"),
          t("print.total"),
        ];

        // Draw header texts
        headers.forEach((header, idx) => {
          drawText(header, colStarts[idx] + 3, yPosition - lineHeight + 5, {
            size: 10,
            font: boldFont,
            color: rgb(1, 1, 1), // White text
          });
        });

        yPosition -= lineHeight;

        // Draw each bill as a row in the table
        // We'll display max 20 bills per page
        const itemsPerPage = 20;
        let itemCount = 0;
        let rowIsGray = false;

        for (let i = 0; i < bills.length; i++) {
          const bill = bills[i];

          // If we reach the page limit, add a new page and reset counters
          if (itemCount >= itemsPerPage || yPosition < margin + lineHeight) {
            // Add new page
            const newPage = pdfDoc.addPage([595.28, 841.89]);
            yPosition = height - margin;

            // Add page header
            drawText(
              t("print.invoiceList") + " " + t("print.continued"),
              width / 2,
              yPosition,
              {
                size: 14,
                font: boldFont,
                align: "center",
              }
            );
            yPosition -= lineHeight * 2;

            // Reset counter
            itemCount = 0;
            rowIsGray = false;

            // Draw table header again
            page.drawRectangle({
              x: margin,
              y: yPosition - lineHeight,
              width: tableWidth,
              height: lineHeight,
              color: rgb(0.5, 0.57, 0.7), // Blue header
            });

            // Header text again
            headers.forEach((header, idx) => {
              drawText(header, colStarts[idx] + 3, yPosition - lineHeight + 5, {
                size: 10,
                font: boldFont,
                color: rgb(1, 1, 1), // White text
              });
            });

            yPosition -= lineHeight;
          }

          // Alternating row colors
          const rowColor = rowIsGray ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1);
          rowIsGray = !rowIsGray;

          page.drawRectangle({
            x: margin,
            y: yPosition - lineHeight,
            width: tableWidth,
            height: lineHeight,
            color: rowColor,
          });

          // Draw row data
          // #
          drawText(
            (i + 1).toString(),
            colStarts[0] + 3,
            yPosition - lineHeight + 5,
            { size: 10 }
          );

          // Date
          drawText(
            formatDate(bill.purchaseAt),
            colStarts[1] + 3,
            yPosition - lineHeight + 5,
            { size: 10 }
          );

          // Invoice No
          drawText(
            `#${bill.id}`,
            colStarts[2] + 3,
            yPosition - lineHeight + 5,
            { size: 10 }
          );

          // Customer name - handle long names
          const customerName = `${bill.cName || ""} ${bill.cLastName || ""}`;
          drawText(
            customerName.length > 20
              ? customerName.substring(0, 17) + "..."
              : customerName,
            colStarts[3] + 3,
            yPosition - lineHeight + 5,
            { size: 10 }
          );

          // Payment status
          const statusColor = bill.cashStatus
            ? rgb(0, 0.5, 0)
            : rgb(0.8, 0.4, 0); // Green for paid, red for unpaid
          drawText(
            bill.cashStatus ? t("print.paid") : t("print.unpaid"),
            colStarts[4] + 3,
            yPosition - lineHeight + 5,
            { size: 10, color: statusColor }
          );

          // Price
          drawText(
            formatCurrencyForPDF(bill.price),
            colStarts[5] + 3,
            yPosition - lineHeight + 5,
            { size: 10 }
          );

          // Total with VAT
          drawText(
            formatCurrencyForPDF(bill.price * bill.amount),
            colStarts[6] + 3,
            yPosition - lineHeight + 5,
            { size: 10 }
          );

          yPosition -= lineHeight;
          itemCount++;
        }

        // Draw totals row with bold formatting
        page.drawRectangle({
          x: margin,
          y: yPosition - lineHeight,
          width: tableWidth,
          height: lineHeight,
          color: rgb(0.9, 0.9, 0.9), // Light gray for total row
        });

        // Totals text
        drawText(t("print.total"), margin + 3, yPosition - lineHeight + 5, {
          size: 10,
          font: boldFont,
        });

        // Total amount
        const totalAmount = bills.reduce(
          (sum, bill) => sum + bill.price * bill.amount,
          0
        );

        // Draw empty cells for date, invoice, customer
        // Draw the total amount in the price and total columns
        drawText(
          formatCurrencyForPDF(totalAmount),
          colStarts[5] + 3,
          yPosition - lineHeight + 5,
          {
            size: 10,
            font: boldFont,
          }
        );

        drawText(
          formatCurrencyForPDF(totalAmount),
          colStarts[6] + 3,
          yPosition - lineHeight + 5,
          {
            size: 10,
            font: boldFont,
          }
        );
      } else {
        // No invoices message
        drawText(t("print.noInvoicesFound"), margin, yPosition, {
          size: 12,
          font: italicFont,
        });
      }

      // Add footer with generation date and page number
      const footerY = margin / 2;
      const footerText = `${t("print.generatedOn")} ${format(
        new Date(),
        "dd/MM/yyyy HH:mm"
      )} - ${t("print.page")} 1 - Flexi Business App`;
      drawText(footerText, width / 2, footerY, {
        size: 8,
        align: "center",
        color: rgb(0.5, 0.5, 0.5),
      });

      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();

      // Convert the Uint8Array to a base64 string
      const uint8Array = new Uint8Array(pdfBytes);
      let binary = "";
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const pdfBase64 = btoa(binary);

      // Generate a filename
      const fileName = `income_report_${format(selectedMonth, "yyyy-MM")}.pdf`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Write the PDF to the file system
      await FileSystem.writeAsStringAsync(filePath, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Hide loading indicator
      setAlertConfig((prev) => ({ ...prev, visible: false }));

      // Show PDF preview options modal
      setPdfPreviewUri(filePath);
      setPdfPreviewModalVisible(true);
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

  // Function to handle sharing the PDF file
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
            <View className="flex-row">
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
              style={{ color: "white", fontSize: 12 }}>
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

                <View
                  className={`p-4 rounded-lg ${
                    theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"
                  } mb-6`}
                >
                  <View className="flex-row justify-between mb-2">
                    <CustomText weight="bold">
                      {t("print.productName")}
                    </CustomText>
                    <CustomText weight="bold">{t("print.quantity")}</CustomText>
                    <CustomText weight="bold">{t("print.price")}</CustomText>
                    <CustomText weight="bold">{t("print.total")}</CustomText>
                  </View>
                  <View className="flex-row justify-between">
                    <CustomText>{selectedInvoice.product}</CustomText>
                    <CustomText>{selectedInvoice.amount}</CustomText>
                    <CustomText>
                      {formatCurrency(selectedInvoice.price)}
                    </CustomText>
                    <CustomText>
                      {formatCurrency(
                        selectedInvoice.price * selectedInvoice.amount
                      )}
                    </CustomText>
                  </View>
                </View>

                <View className="flex-row justify-end">
                  <View className="w-1/2">
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
                handlePress={handlePrint}
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
                    {format(selectedMonth, "MMMM yyyy")}
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
