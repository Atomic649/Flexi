import { format } from "date-fns";
import { vatRate } from "../TaxVariable";

interface MonthlyReportData {
  selectedMonth: Date;
  businessDetails: any;
  businessName: string | null;
  bills: any[];
  t: any;
  formatCurrencyForPDF: (amount: number) => string;
  formatDate: (dateString: string) => string;
  formatMonthYear: (date: Date, t: any) => string;
}

export const generateMonthlyReportHTML = (data: MonthlyReportData): string => {
  const {
    selectedMonth,
    businessDetails,
    businessName,
    bills,
    t,
    formatCurrencyForPDF,
    formatDate,
    formatMonthYear,
  } = data;

  const brandColor = businessDetails?.businessColor || "#5e5e5e";
  const logoUrl = businessDetails?.logo || null;

  // Only include bills with DocumentType === 'Receipt'
  const receiptBills = bills.filter((bill) => {
    if (Array.isArray(bill.DocumentType)) {
      return bill.DocumentType.includes("Receipt");
    }
    return bill.DocumentType === "Receipt";
  });

  // Check if business is VAT registered
  const isVatRegistered = businessDetails?.vat === true;

  // Recalculate monthlyTotals based on receiptBills
  const totalSales = receiptBills.reduce(
    (sum: number, bill: any) => sum + (Number(bill.total) || 0),
    0,
  );
  const totalSalesBeforeTax = receiptBills.reduce(
    (sum: number, bill: any) => sum + (Number(bill.totalBeforeTax) || 0),
    0,
  );
  const whtBills = receiptBills.filter(
    (bill: any) => (Number(bill.WHTAmount) || 0) > 0,
  );
  const WHTAmount = receiptBills.reduce(
    (sum: number, bill: any) => sum + (Number(bill.WHTAmount) || 0),
    0,
  );
  const totalOrders = receiptBills.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const filteredMonthlyTotals = {
    totalSales,
    totalOrders,
    averageOrderValue,
  };

  // Calculate totals for all product items across all
  const vatTotal = isVatRegistered
    ? receiptBills.reduce(
        (sum: number, bill: any) => sum + (Number(bill.totalTax) || 0),
        0,
      )
    : 0;
  const grandTotal = isVatRegistered
    ? receiptBills.reduce(
        (sum: number, bill: any) => sum + (Number(bill.totalAfterTax) || 0),
        0,
      )
    : totalSales;
  const rawTotal = receiptBills.reduce(
    (sum: number, bill: any) => sum + (Number(bill.totalBeforeTax) || 0),
    0,
  );
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${isVatRegistered ? t("print.salesTaxVatSummary") : t("print.salesTaxSummary")} - ${formatMonthYear(selectedMonth, t)}</title>
        <style>
          :root { --brand-color: ${brandColor}; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
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
            border-bottom: 2px solid var(--brand-color);
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
            background-color: var(--brand-color);
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
          ${logoUrl ? `<div style="text-align:center; margin-bottom:10px;"><img src="${logoUrl}" alt="logo" style="width:80px;height:80px;object-fit:contain;border-radius:8px;" /></div>` : ""}
          <h1>${isVatRegistered ? t("print.salesTaxVatSummary") : t("print.salesTaxSummary")}</h1>
          <h2>${t("print.monthlyReport")} ${formatMonthYear(selectedMonth, t)}</h2>

          <div class="company-info">
            <h3>${businessDetails?.taxType === "Juristic" ? t("print.companyInformation") : t("print.storeInformation")}</h3>
            <p><strong>${businessDetails?.taxType === "Juristic" ? t("print.companyName") : t("print.storeName")}:</strong> ${businessDetails?.businessName || businessName || "Your Business Name"}</p>
            <p><strong>${t("print.address")}:</strong> ${businessDetails?.businessAddress || "Not specified"}</p>
            <p><strong>${t("print.taxId")}:</strong> ${businessDetails?.taxId || "Not specified"}</p>
          </div>

          <h3>${t("print.monthlySummary")}</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="label">${t("print.totalSalesAfterTax")}</div>
              <div class="value">${formatCurrencyForPDF(filteredMonthlyTotals.totalSales)}</div>
            </div>
              <div class="summary-card">
              <div class="label">${t("print.totalSalesBeforeTax")}</div>
              <div class="value">${formatCurrencyForPDF(totalSalesBeforeTax)}</div>
            </div>
          
            <div class="summary-card">
              <div class="label">${t("print.totalOrders")}</div>
              <div class="value">${filteredMonthlyTotals.totalOrders}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("print.avgOrderValue")}</div>
              <div class="value">${formatCurrencyForPDF(filteredMonthlyTotals.averageOrderValue)}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("print.whtAmount")}</div>
              <div class="value">${formatCurrencyForPDF(WHTAmount)}</div>
            </div>
              
            ${
              isVatRegistered
                ? `
            <div class="summary-card">
              <div class="label">${t("print.vatAmount")} (${vatRate}%)</div>
              <div class="value">${formatCurrencyForPDF(vatTotal)}</div>
            </div>
            `
                : ""
            }
          </div>

          <h3>${isVatRegistered ? t("print.taxInvoiceList") : t("print.receiptList")}</h3>
          ${
            receiptBills.length > 0
              ? `
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>${t("print.date")}</th>
                  <th>${t("print.invoiceNo")}</th>
                  <th>${t("print.customer")}</th>
                  <th>${t("print.productDetails")}</th>
                  <th class="text-right">${t("print.price")}</th>
                  ${
                    isVatRegistered
                      ? `<th class="text-right">VAT (${vatRate}%)</th>
                  <th class="text-right">${t("print.total")}</th>`
                      : ""
                  }
                </tr>
              </thead>
              <tbody>
                ${receiptBills
                  .map((bill: any, index: number) => {
                    // Multi-product: sum all product items for this bill

                    const productItems = bill.product || [];
                    return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${formatDate(bill.purchaseAt)}</td>
                      <td>#${bill.billId}</td>
                      <td>${bill.cName || ""} ${bill.cLastName || ""}</td>
                      <td>
                        <ul style="margin:0; padding-left:16px;">
                          ${productItems
                            .map(
                              (item: any, idx: any) =>
                                `<li>${item.productList?.name ?? item.product ?? "-"} ${item.unit !== "NotSpecified" ? `${item.quantity} ${item.unit ? t(`product.unit.${item.unit}`) : ""}` : ""} </li>`,
                            )
                            .join("")}
                        </ul>
                      </td>
                      <td class="text-right">${formatCurrencyForPDF(bill.totalBeforeTax)}</td>
                      ${
                        isVatRegistered
                          ? `<td class="text-right">${formatCurrencyForPDF(bill.totalTax)}</td>
                      <td class="text-right">${formatCurrencyForPDF(bill.totalAfterTax)}</td>`
                          : ""
                      }
                    </tr>
                  `;
                  })
                  .join("")}
                <tr style="background-color: #e5e7eb; font-weight: bold;">
                  <td colspan="5" class="text-right bold">${t("print.total")}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(rawTotal)}</td>
                  ${
                    isVatRegistered
                      ? `<td class="text-right bold">${formatCurrencyForPDF(vatTotal)}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(grandTotal)}</td>`
                      : ""
                  }
                </tr>
              </tbody>
            </table>
          `
              : `
            <div class="no-data">
              ${t("print.noInvoicesFound")}
            </div>
          `
          }

          ${
            whtBills.length > 0
              ? `
            <div class="page-break"></div>
            <div style="height: 20px;"></div>
            <h3>${t("print.whtDetailList") || "Withholding Tax List"}</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>${t("print.date")}</th>
                  <th>${t("print.invoiceNo")}</th>
                  <th>${t("print.customer")}</th>
                  <th>${t("print.productDetails")}</th>
                  <th class="text-right">${t("print.totalSalesBeforeTax")}</th>
                  <th class="text-right">${t("print.whtPercent") || "WHT %"}</th>
                  <th class="text-right">${t("print.whtAmount")}</th>
                </tr>
              </thead>
              <tbody>
                ${whtBills
                  .map((bill: any, index: number) => {
                    const productItems = bill.product || [];
                    return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${formatDate(bill.purchaseAt)}</td>
                      <td>#${bill.billId}</td>
                      <td>${bill.cName || ""} ${bill.cLastName || ""}</td>
                      <td>
                        <ul style="margin:0; padding-left:16px;">
                          ${productItems
                            .map(
                              (item: any, idx: any) =>
                                `<li>${item.productList?.name ?? item.product ?? "-"} ${item.unit !== "NotSpecified" ? `${item.quantity} ${item.unit ? t(`product.unit.${item.unit}`) : ""}` : ""} </li>`,
                            )
                            .join("")}
                        </ul>
                      </td>
                      <td class="text-right">${formatCurrencyForPDF(bill.totalBeforeTax)}</td>
                      <td class="text-right">${bill.WHTpercent || 0}%</td>
                      <td class="text-right">${formatCurrencyForPDF(bill.WHTAmount)}</td>
                    </tr>
                  `;
                  })
                  .join("")}
                <tr style="background-color: #e5e7eb; font-weight: bold;">
                  <td colspan="7" class="text-right bold">${t("print.total")}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(WHTAmount)}</td>
                </tr>
              </tbody>
            </table>
            `
              : ""
          }

          <div class="footer">
            ${t("print.generatedOn")} ${format(new Date(), "dd/MM/yyyy HH:mm")} - Flexi Business Hub
          </div>
        </div>
      </body>
    </html>
  `;
};
