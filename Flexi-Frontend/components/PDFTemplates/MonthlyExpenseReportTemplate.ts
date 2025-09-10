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
    monthlyTotals,
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
  const totalExpenseCount = actualExpenses.length;
  const vatExpenses = actualExpenses.filter((expense: any) => expense.vat).length;
  const whtExpenses = actualExpenses.filter((expense: any) => expense.withHoldingTax).length;
  const averageExpenseAmount = totalExpenseCount > 0 ? totalExpenses / totalExpenseCount : 0;

  // Calculate total VAT and WHT amounts
  const totalVatAmount = actualExpenses.reduce((sum: number, expense: any) => 
    sum + (expense.vat ? (Number(expense.vatAmount) || 0) : 0), 0);
  const totalWhtAmount = actualExpenses.reduce((sum: number, expense: any) => 
    sum + (expense.withHoldingTax ? (Number(expense.WHTAmount) || 0) : 0), 0);

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
            background-color: #dc2626; 
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
            grid-template-columns: repeat(3, 1fr);
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
            background-color: #374151;
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
              <div class="label">${t("print.expenseCount")}</div>
              <div class="value">${totalExpenseCount}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("print.avgExpenseAmount")}</div>
              <div class="value">${formatCurrencyForPDF(averageExpenseAmount)}</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("print.vatIncludedExpenses")}</div>
              <div class="value">${vatExpenses} (${formatCurrencyForPDF(totalVatAmount)})</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("print.whtIncludedExpenses")}</div>
              <div class="value">${whtExpenses} (${formatCurrencyForPDF(totalWhtAmount)})</div>
            </div>
            <div class="summary-card">
              <div class="label">${t("print.netExpenseAmount")}</div>
              <div class="value">${formatCurrencyForPDF(totalExpenses - totalWhtAmount)}</div>
            </div>
          </div>

          <h3>${t("print.expensesByCategory")}</h3>
          <table class="category-table">
            <thead>
              <tr>
                <th>${t("print.category")}</th>
                <th class="text-center">${t("print.count")}</th>
                <th class="text-right">${t("print.amount")}</th>
                <th class="text-right">${t("print.percentage")}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(expensesByGroup).map(([group, data]) => `
                <tr>
                  <td><span class="expense-group">${t(`expense.group.${group.toLowerCase()}`) || group}</span></td>
                  <td class="text-center">${data.count}</td>
                  <td class="text-right">${formatCurrencyForPDF(data.amount)}</td>
                  <td class="text-right">${totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0}%</td>
                </tr>
              `).join('')}
              <tr style="background-color: #e5e7eb; font-weight: bold;">
                <td class="bold">${t("print.total")}</td>
                <td class="text-center bold">${totalExpenseCount}</td>
                <td class="text-right bold">${formatCurrencyForPDF(totalExpenses)}</td>
                <td class="text-right bold">100%</td>
              </tr>
            </tbody>
          </table>

          <h3>${t("print.expenseDetailList")}</h3>
          ${actualExpenses.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>${t("print.date")}</th>
                  <th>${t("print.description")}</th>
                  <th>${t("print.category")}</th>
                  <th>${t("print.supplier")}</th>
                  <th class="text-right">${t("print.amount")}</th>
                  <th class="text-center">${t("print.vat")}</th>
                  <th class="text-center">${t("print.wht")}</th>
                  <th class="text-right">${t("print.netAmount")}</th>
                </tr>
              </thead>
              <tbody>
                ${actualExpenses.map((expense: any, index: number) => {
                  const vatAmount = expense.vat ? (expense.vatAmount || 0) : 0;
                  const whtAmount = expense.withHoldingTax ? (expense.WHTAmount || 0) : 0;
                  const netAmount = (expense.amount || 0) - whtAmount;
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${formatDate(expense.date)}</td>
                      <td>${expense.desc || '-'}</td>
                      <td><span class="expense-group">${t(`expense.group.${(expense.group || 'other').toLowerCase()}`) || expense.group || 'Other'}</span></td>
                      <td>${expense.sName || '-'}</td>
                      <td class="text-right">${formatCurrencyForPDF(expense.amount || 0)}</td>
                      <td class="text-center">${expense.vat ? `<span class="vat-included">✓</span>` : '-'}</td>
                      <td class="text-center">${expense.withHoldingTax ? `<span class="wht-included">✓</span>` : '-'}</td>
                      <td class="text-right">${formatCurrencyForPDF(netAmount)}</td>
                    </tr>
                  `;
                }).join('')}
                <tr style="background-color: #fee2e2; font-weight: bold;">
                  <td colspan="5" class="text-right bold">${t("print.total")}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(totalExpenses)}</td>
                  <td class="text-center bold">${formatCurrencyForPDF(totalVatAmount)}</td>
                  <td class="text-center bold">${formatCurrencyForPDF(totalWhtAmount)}</td>
                  <td class="text-right bold">${formatCurrencyForPDF(totalExpenses - totalWhtAmount)}</td>
                </tr>
              </tbody>
            </table>
          ` : `
            <div class="no-data">
              ${t("print.noExpensesFound")}
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