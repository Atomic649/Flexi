import { format } from "date-fns";

interface MonthlyReportData {
  selectedMonth: Date;
  businessDetails: any;
  businessName: string | null;
  monthlyTotals: {
    totalSales: number;
    totalOrders: number;
    paidOrders: number;
    unpaidOrders: number;
    averageOrderValue: number;
  };
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
    monthlyTotals,
    bills,
    t,
    formatCurrencyForPDF,
    formatDate,
    formatMonthYear,
  } = data;

  // Check if business is VAT registered
  const isVatRegistered = businessDetails?.vat === true;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${isVatRegistered  ? t("print.salesTaxVatSummary"): t("print.salesTaxSummary")} - ${formatMonthYear(selectedMonth, t)}</title>
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
          <h1>${isVatRegistered ? t("print.salesTaxVatSummary") : t("print.salesTaxSummary")}</h1>
          <h2>${t("print.monthlyReport")} ${formatMonthYear(selectedMonth, t)}</h2>

          <div class="company-info">
            <h3>${businessDetails?.taxType === "Juristic" ? t("print.companyInformation") : t("print.storeInformation")}</h3>
            <p><strong>${businessDetails?.taxType === "Juristic" ? t("print.companyName") : t("print.storeName")}:</strong> ${businessDetails?.businessName || businessName || "Your Business Name"}</p>
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
            ${isVatRegistered ? `
            <div class="summary-card">
              <div class="label">${t("print.vatAmount")} (7%)</div>
              <div class="value">${formatCurrencyForPDF(monthlyTotals.totalSales * 0.07)}</div>
            </div>
            ` : ''}
          </div>

          <h3>${isVatRegistered ? t("print.taxInvoiceList") : t("print.receiptList")}</h3>
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
                  ${isVatRegistered ? `<th class="text-right">VAT (7%)</th>
                  <th class="text-right">${t("print.total")}</th>` : ''}
                </tr>
              </thead>
              <tbody>
                ${bills.map((bill, index) => {
                  const subtotal = bill.price * bill.amount;
                  const vatAmount = isVatRegistered ? subtotal * 0.07 : 0;
                  const total = subtotal + vatAmount;
                  
                  return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${formatDate(bill.purchaseAt)}</td>
                    <td>#${bill.id}</td>
                    <td>${bill.cName || ''} ${bill.cLastName || ''}</td>
                    <td class="${bill.cashStatus ? 'status-paid' : 'status-unpaid'}">
                      ${bill.cashStatus ? t("print.paid") : t("print.unpaid")}
                    </td>
                    <td class="text-right">${formatCurrencyForPDF(subtotal)}</td>
                    ${isVatRegistered ? `<td class="text-right">${formatCurrencyForPDF(vatAmount)}</td>
                    <td class="text-right">${formatCurrencyForPDF(total)}</td>` : ''}
                  </tr>
                `;
                }).join('')}
                <tr style="background-color: #e5e7eb; font-weight: bold;">
                  <td colspan="5" class="text-right bold">${t("print.total")}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(bills.reduce((sum, bill) => sum + (bill.price * bill.amount), 0))}</td>
                  ${isVatRegistered ? `<td class="text-right bold">${formatCurrencyForPDF(bills.reduce((sum, bill) => sum + (bill.price * bill.amount * 0.07), 0))}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(bills.reduce((sum, bill) => {
                    const subtotal = bill.price * bill.amount;
                    const vatAmount = isVatRegistered ? subtotal * 0.07 : 0;
                    return sum + subtotal + vatAmount;
                  }, 0))}</td>` : ''}
                </tr>
              </tbody>
            </table>
          ` : `
            <div class="no-data">
              ${t("print.noInvoicesFound")}
            </div>
          `}

          <div class="footer">
            ${t("print.generatedOn")} ${format(new Date(), "dd/MM/yyyy HH:mm")} - Flexi Business Hub
          </div>
        </div>
      </body>
    </html>
  `;
};