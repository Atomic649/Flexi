import { format } from "date-fns";

interface MonthlyExpenseReportData {
  selectedMonth: Date;
  businessDetails: any;
  businessName: string | null;
  monthlyTotals: {
    totalExpenses: number;
    totalExpenseCount: number;
    vatExpenses: number;
    whtExpenses: number;
    averageExpenseAmount: number;
    expensesByGroup: { [key: string]: number };
  };
  expenses: any[];
  t: any;
  formatCurrencyForPDF: (amount: number) => string;
  formatDate: (dateString: string) => string;
  formatMonthYear: (date: Date, t: any) => string;
}

export const generateExpenseReportHTML = (data: MonthlyExpenseReportData): string => {
  const {
    selectedMonth,
    businessDetails,
    businessName,
    expenses,
    t,
    formatCurrencyForPDF,
    formatDate,
    formatMonthYear,
  } = data;

  // Use all expenses (including drafts) for expense reporting
  const actualExpenses = expenses;

  // Recalculate totals based on all expenses
  const totalExpenses = actualExpenses.reduce((sum: number, expense: any) => sum + (Number(expense.amount) || 0), 0);
  const vatExpensesList = actualExpenses.filter((expense: any) => expense.vat);
  

  // Calculate total VAT and WHT amounts
  const totalVatAmount = actualExpenses.reduce((sum: number, expense: any) => 
    sum + (expense.vat ? (Number(expense.vatAmount) || 0) : 0), 0);
  const totalVatSum = actualExpenses.reduce((sum: number, expense: any) => 
    sum + (expense.vat ? (Number(expense.amount) || 0) : 0), 0);
  const totalWhtAmount = actualExpenses.reduce((sum: number, expense: any) => 
    sum + (expense.withHoldingTax ? (Number(expense.WHTAmount) || 0) : 0), 0);

  // Calculate total tax expenses (amount - vatAmount)
  const totalTaxExpenses = actualExpenses.reduce((sum: number, expense: any) => {
    const totalAmount = Number(expense.amount) || 0;
    const vatAmount = expense.vat ? (Number(expense.vatAmount) || 0) : 0;
    return sum + (totalAmount - vatAmount);
  }, 0);

  // Group expenses by category
  const expensesByGroup: { [key: string]: { count: number, amount: number } } = {};
  actualExpenses.forEach((expense: any) => {
    const group = expense.group || 'Other';
    if (!expensesByGroup[group]) {
      expensesByGroup[group] = { count: 0, amount: 0 };
    }
    expensesByGroup[group].count++;
    expensesByGroup[group].amount += expense.amount || 0;
  });

  // Check if business is VAT registered
  const isVatRegistered = businessDetails?.vat === true;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${t("print.monthlyExpenseReport")} - ${formatMonthYear(selectedMonth, t)}</title>
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
            border-bottom: 2px solid #dc2626;
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
            background-color: #fef2f2; 
            color: #dc2626;
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
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          .summary-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background-color: #fef2f2;
          }
          .summary-card .label {
            font-size: 11px;
            color: #666;
            margin-bottom: 5px;
          }
          .summary-card .value {
            font-size: 16px;
            font-weight: bold;
            color: #dc2626;
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
          .expense-group {
            background-color: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
          }
          .vat-included { 
            color: #059669; 
            font-weight: bold; 
          }
          .wht-included { 
            color: #7c2d12; 
            font-weight: bold; 
          }
          .no-data {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
          }
          .category-table {
            margin: 20px 0;
          }
          .category-table th {
            background-color: #fef2f2;
            color: #dc2626;
          }
          .page-break {
            page-break-before: always;
          }
          .page-break-with-margin {
            page-break-before: always;
            margin-top: 50px;
            padding-top: 30px;
          }
          @media print {
            .page-break {
              page-break-before: always;
            }
            .page-break-with-margin {
              page-break-before: always;
              margin-top: 50px;
              padding-top: 30px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${t("print.monthlyExpenseReport")}</h1>
          <h2>${t("print.monthlyReport")} ${formatMonthYear(selectedMonth, t)}</h2>

          <div class="company-info">
            <h3>${businessDetails?.taxType === "Juristic" ? t("print.companyInformation") : t("print.storeInformation")}</h3>
            <p><strong>${businessDetails?.taxType === "Juristic" ? t("print.companyName") : t("print.storeName")}:</strong> ${businessDetails?.businessName || businessName || "Your Business Name"}</p>
            <p><strong>${t("print.address")}:</strong> ${businessDetails?.businessAddress || "Not specified"}</p>
            <p><strong>${t("print.taxId")}:</strong> ${businessDetails?.taxId || "Not specified"}</p>
          </div>

          <h3>${t("print.expenseSummary")}</h3>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="label">${t("print.totalExpenses")}</div>
              <div class="value">${formatCurrencyForPDF(totalExpenses)}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("print.totalTaxExpenses")}</div>
              <div class="value">${formatCurrencyForPDF(totalTaxExpenses)}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("print.totalVat")}</div>
              <div class="value"> ${formatCurrencyForPDF(totalVatAmount)}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("print.totalWht")}</div>
              <div class="value"> ${formatCurrencyForPDF(totalWhtAmount)}</div>
            </div>
          </div>

          <h3>${t("print.expenseList")}</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${t("print.date")}</th>
                <th>${t("print.expenseNo")}</th>
                <th>${t("print.supplier")}</th>
                <th>${t("expense.detail.note")}</th>
                <th class="text-right">${t("print.amountIncVat")}</th>
                <th class="text-right">${t("print.amount")}</th>
              </tr>
            </thead>
            <tbody>
              ${actualExpenses.map((expense: any, index: number) => {
                const totalAmount = Number(expense.amount) || 0;
                const vatAmount = expense.vat ? (Number(expense.vatAmount) || 0) : 0;
                const netAmount = totalAmount - vatAmount;
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${formatDate(expense.date)}</td>
                    <td>${expense.expNo || '-'}</td>
                    <td>${expense.sName || '-'}</td>
                    <td>${expense.note || '-'}</td>
                    <td class="text-right">${formatCurrencyForPDF(totalAmount)}</td>
                    <td class="text-right">${formatCurrencyForPDF(netAmount)}</td>
                  </tr>
                `;
              }).join('')}
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="5" class="text-right bold">${t("print.total")}</td>
                <td class="text-right bold">${formatCurrencyForPDF(totalExpenses)}</td>
                <td class="text-right bold">${formatCurrencyForPDF(totalTaxExpenses)}</td>
              </tr>
            </tbody>
          </table>

          <div class="page-break-with-margin">
            <h3>${t("print.vatDetailList")}</h3>
            <table class="vat-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>${t("print.date")}</th>
                  <th>${t("print.taxInvoiceNo")}</th>
                  <th>${t("print.supplier")}</th>
                  <th>${t("print.taxId")}</th>
                  <th>${t("print.branch")}</th>
                  <th class="text-right">${t("print.amountIncVat")}</th>
                  <th class="text-right">${t("print.vatAmount")}</th>
                </tr>
              </thead>
              <tbody>
                ${vatExpensesList.map((expense: any, index: number) => {
                  const amount = Number(expense.amount) || 0;
                  const vatAmount = Number(expense.vatAmount) || 0;
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${formatDate(expense.date)}</td>
                      <td>${expense.taxInvoiceNo || '-'}</td>
                      <td>${expense.sName || '-'}</td>
                      <td>${expense.sTaxId || '-'}</td>
                      <td>${(() => {
                        if (!expense.branch || expense.branch === '-') return '-';
                        if (expense.branch === 'headOffice') return '00000';
                        // Convert branch to number and pad with zeros
                        const branchNum = parseInt(expense.branch) || 0;
                        return branchNum.toString().padStart(5, '0');
                      })()}</td>
                      <td class="text-right">${formatCurrencyForPDF(amount)}</td>
                      <td class="text-right">${formatCurrencyForPDF(vatAmount)}</td>
                    </tr>
                  `;
                }).join('')}
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                  <td colspan="6" class="text-right bold">${t("print.total")}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(totalVatSum)}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(totalVatAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="page-break-with-margin">
            <h3>${t("print.whtDetailList")}</h3>
            ${actualExpenses.filter((expense: any) => expense.withHoldingTax).length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>${t("print.date")}</th>
                    <th>${t("print.supplier")}</th>
                    <th>${t("print.taxId")}</th>
                    <th>${t("print.category")}</th>
                    <th class="text-center">${t("print.whtPercent")}</th>
                    <th class="text-right">${t("print.amount")}</th>
                    <th class="text-right">${t("print.whtAmount")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${actualExpenses.filter((expense: any) => expense.withHoldingTax).map((expense: any, index: number) => {
                    const whtAmount = Number(expense.WHTAmount) || 0;
                    const netAmount = (Number(expense.amount) || 0) - whtAmount;
                    const whtPercent = Number(expense.WHTpercent) || 0;
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${formatDate(expense.date)}</td>
                        <td>${expense.sName || '-'}</td>
                        <td>${expense.sTaxId || '-'}</td>
                        <td><span class="expense-group">${t(`expense.detail.group.${expense.group?.toLowerCase()}`) || expense.group || '-'}</span></td>
                        <td class="text-center">${whtPercent}%</td>
                        <td class="text-right">${formatCurrencyForPDF(Number(expense.amount) || 0)}</td>
                        <td class="text-right">${formatCurrencyForPDF(whtAmount)}</td>
                      </tr>
                    `;
                  }).join('')}
                  <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td colspan="6" class="text-right bold">${t("print.total")}</td>
                    <td class="text-right bold">${formatCurrencyForPDF(
                      actualExpenses.filter((expense: any) => expense.withHoldingTax)
                        .reduce((sum: number, expense: any) => sum + (Number(expense.amount) || 0), 0)
                    )}</td>
                    <td class="text-right bold">${formatCurrencyForPDF(totalWhtAmount)}</td>
                  </tr>
                </tbody>
              </table>
            ` : `
              <div class="no-data">
                ${t("print.noWhtExpensesFound")}
              </div>
            `}
          </div>

          <div class="page-break-with-margin">
            <h3>${t("print.expensesByCategory")}</h3>
            <table class="category-table">
              <thead>
                <tr>
                  <th>${t("print.category")}</th>
                  <th class="text-right">${t("print.amount")}</th>
                  <th class="text-right">${t("print.percentage")}</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(expensesByGroup).map(([group, data]) => `
                  <tr>
                    <td><span class="expense-group">${t(`expense.detail.group.${group.toLowerCase()}`) || group}</span></td>
                    <td class="text-right">${formatCurrencyForPDF(data.amount)}</td>
                    <td class="text-right">${totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0}%</td>
                  </tr>
                `).join('')}
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                  <td class="bold">${t("print.total")}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(totalExpenses)}</td>
                  <td class="text-right bold">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            ${t("print.generatedOn")} ${format(new Date(), "dd/MM/yyyy HH:mm")} - Flexi Business Hub
          </div>
        </div>
      </body>
    </html>
  `;
};