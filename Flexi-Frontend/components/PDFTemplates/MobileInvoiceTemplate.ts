import { format } from "date-fns";

interface MobileInvoiceData {
  invoice: any;
  businessDetails: any;
  businessName: string | null;
  t: any;
  formatCurrencyForPDF: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

export const generateMobileInvoiceHTML = (data: MobileInvoiceData): string => {
  const {
    invoice,
    businessDetails,
    businessName,
    t,
    formatCurrencyForPDF,
    formatDate,
  } = data;

  const subtotal = invoice.price * invoice.amount;
  const isVatRegistered = businessDetails?.vat === true;
  const vatAmount = isVatRegistered ? subtotal * 0.07 : 0;
  const grandTotal = subtotal + vatAmount;

  return `
    <html>
      <head>
        <style>
          @page {
            margin: 8mm;
            size: A4 portrait;
          }
          * {
            box-sizing: border-box;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            font-size: 11px;
            line-height: 1.3;
            color: #333;
          }
          .invoice-container { 
            max-width: 100%;
            margin: 0 auto;
            padding: 15px;
          }
          
          /* Header Section */
          .invoice-header { 
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #00d3be;
          }
          .company-logo-section h1 { 
            font-size: 24px; 
            margin: 0; 
            color: #00d3be;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .company-logo-section p {
            margin: 3px 0 0 0;
            font-size: 12px;
            color: #6b7280;
            font-weight: 500;
          }
          .invoice-meta {
            text-align: right;
            min-width: 200px;
          }
          .invoice-number {
            font-size: 16px;
            font-weight: 700;
            color: #00d3be;
            margin: 0 0 5px 0;
          }
          .invoice-date {
            font-size: 11px;
            color: #6b7280;
            margin: 0;
          }
          
          /* Business Info Section */
          .business-info-section {
            background: #f0fdfa;
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 15px;
            border-left: 3px solid #00d3be;
          }
          .business-info-section h3 {
            margin: 0 0 8px 0;
            font-size: 12px;
            font-weight: 600;
            color: #00d3be;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .business-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .business-details p {
            margin: 2px 0;
            font-size: 10px;
            line-height: 1.2;
          }
          .business-details strong {
            color: #374151;
            font-weight: 600;
          }
          
          /* Billing Section */
          .billing-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .billing-section {
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            background-color: #fafbfc;
          }
          .billing-section h3 {
            margin: 0 0 8px 0;
            font-size: 11px;
            font-weight: 600;
            color: #00d3be;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
          .billing-section p {
            margin: 3px 0;
            font-size: 10px;
            line-height: 1.2;
          }
          .customer-name {
            font-weight: 600;
            color: #111827;
            font-size: 11px !important;
          }
          .payment-status {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-top: 5px;
          }
          .status-badge {
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.2px;
          }
          .status-paid { 
            background-color: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
          }
          .status-unpaid { 
            background-color: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
          }
          
          /* Items Table */
          .items-section {
            margin-bottom: 15px;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .items-table th { 
            background: #00d3be;
            color: white; 
            padding: 8px 6px;
            font-size: 10px; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            border: none;
          }
          .items-table td { 
            padding: 8px 6px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
            background-color: #fafbfc;
          }
          .items-table tbody tr:last-child td {
            border-bottom: none;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-medium { font-weight: 500; }
          
          /* Summary Section */
          .summary-section { 
            margin-bottom: 15px;
          }
          .summary-table {
            width: 100%;
            max-width: 300px;
            margin-left: auto;
          }
          .summary-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 5px 0;
            font-size: 11px;
            border-bottom: 1px solid #f3f4f6;
          }
          .summary-row:last-child {
            border-bottom: none;
          }
          .summary-row.subtotal {
            color: #6b7280;
          }
          .summary-row.tax {
            color: #6b7280;
          }
          .summary-row.total { 
            border-top: 2px solid #00d3be;
            margin-top: 5px;
            padding-top: 8px;
            font-weight: 700;
            font-size: 14px;
            color: #00d3be;
          }
          .summary-label {
            font-weight: 500;
          }
          .summary-amount {
            font-weight: 600;
            min-width: 80px;
            text-align: right;
          }
          
          /* Footer */
          .invoice-footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .thank-you {
            font-style: italic;
            color: #6b7280;
            font-size: 11px;
            font-weight: 500;
          }
          .generated-info {
            font-size: 8px;
            color: #9ca3af;
            text-align: right;
          }
          
          /* Professional touches */
          .highlight-box {
            background: #f0fdfa;
            border: 1px solid #99f6e4;
            border-radius: 6px;
            padding: 10px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="invoice-header">
            <div class="company-logo-section">
              <h1>INVOICE</h1>
              <p>Professional Business Solution</p>
            </div>
            <div class="invoice-meta">
              <div class="invoice-number">#${invoice.id}</div>
              <div class="invoice-date">${formatDate(invoice.purchaseAt)}</div>
            </div>
          </div>

          <!-- Business Information -->
          <div class="business-info-section">
            <h3>Company Information</h3>
            <div class="business-details">
              <div>
                <p><strong>Company:</strong> ${
                  businessDetails?.businessName ||
                  businessName ||
                  "Your Business Name"
                }</p>
                <p><strong>Address:</strong> ${
                  businessDetails?.businessAddress || "Not specified"
                }</p>
              </div>
              <div>
                <p><strong>Tax ID:</strong> ${
                  businessDetails?.vatId || "Not specified"
                }</p>
                <p><strong>Contact:</strong> ${
                  businessDetails?.phone || "Not specified"
                }</p>
              </div>
            </div>
          </div>

          <!-- Billing Information -->
          <div class="billing-info">
            <div class="billing-section">
              <h3>Bill To</h3>
              <p class="customer-name">${invoice.cName} ${invoice.cLastName}</p>
              <p>${invoice.cPhone || "Phone not provided"}</p>
              <p>${invoice.cAddress || "Address not provided"}</p>
              <p>${invoice.cProvince || ""} ${invoice.cPostId || ""}</p>
            </div>
            
            <div class="billing-section">
              <h3>Payment Details</h3>
              <p><strong>Method:</strong> ${invoice.payment}</p>
              <p><strong>Date:</strong> ${formatDate(invoice.purchaseAt)}</p>
              <div class="payment-status">
                <strong>Status:</strong>
                <span class="status-badge ${
                  invoice.cashStatus ? "status-paid" : "status-unpaid"
                }">
                  ${invoice.cashStatus ? t("print.paid") : t("print.unpaid")}
                </span>
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="items-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 50%;">${t("print.productName")}</th>
                  <th class="text-center" style="width: 15%;">${t(
                    "print.quantity"
                  )}</th>
                  <th class="text-right" style="width: 17.5%;">${t(
                    "print.price"
                  )}</th>
                  <th class="text-right" style="width: 17.5%;">${t(
                    "print.total"
                  )}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="font-medium">${invoice.product}</td>
                  <td class="text-center">${invoice.amount}</td>
                  <td class="text-right">${formatCurrencyForPDF(
                    invoice.price
                  )}</td>
                  <td class="text-right font-medium">${formatCurrencyForPDF(
                    subtotal
                  )}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary -->
          <div class="summary-section">
            <div class="summary-table">
              <div class="summary-row subtotal">
                <span class="summary-label">${t("print.subtotal")}:</span>
                <span class="summary-amount">${formatCurrencyForPDF(
                  subtotal
                )}</span>
              </div>
              ${isVatRegistered ? `
              <div class="summary-row tax">
                <span class="summary-label">${t("print.tax")} (7%):</span>
                <span class="summary-amount">${formatCurrencyForPDF(
                  vatAmount
                )}</span>
              </div>
              ` : ''}
              <div class="summary-row total">
                <span class="summary-label">${t("print.grandTotal")}:</span>
                <span class="summary-amount">${formatCurrencyForPDF(
                  grandTotal
                )}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="invoice-footer">
            <div class="thank-you">
              ${t("print.thankYou")}
            </div>
            <div class="generated-info">
              ${t("print.generatedOn")} ${format(
    new Date(),
    "dd/MM/yyyy HH:mm"
  )}<br>
              Powered by Flexi Business App
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
