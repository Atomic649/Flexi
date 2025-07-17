import { format } from "date-fns";

interface InvoiceData {
  invoice: any;
  businessDetails: any;
  businessName: string | null;
  t: any;
  formatCurrencyForPDF: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

export const generateInvoiceHTML = (data: InvoiceData): string => {
  const {
    invoice,
    businessDetails,
    businessName,
    t,
    formatCurrencyForPDF,
    formatDate,
  } = data;

  const subtotal = invoice.price * invoice.amount;
  const vatAmount = subtotal * 0.07;
  const grandTotal = subtotal + vatAmount;

  return `
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
            ${t("print.generatedOn")} ${format(new Date(), "dd/MM/yyyy HH:mm")} - Flexi Business App
          </div>
        </div>
      </body>
    </html>
  `;
};