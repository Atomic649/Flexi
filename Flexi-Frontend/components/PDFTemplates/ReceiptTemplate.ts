import { vatRate } from "../TaxVariable";
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

  // Use correct field from backend: invoice.product (array of ProductItem)
  const productItems = invoice.product || [];
  const isVatRegistered = businessDetails?.vat === true;
  const rawTotal = productItems.reduce(
    (sum: number, item: any) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalDiscount =
    productItems.reduce(
      (sum: number, item: any) =>
        sum + (item.unitDiscount || 0) * item.quantity,
      0
    ) + (invoice.billLevelDiscount || 0);

  const vatTotal = isVatRegistered
    ? ((rawTotal - totalDiscount) * vatRate) / (100 + vatRate)
    : 0;
  const subTotal = rawTotal - totalDiscount - vatTotal;
  const grandTotal = rawTotal - totalDiscount;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${
          isVatRegistered ? t("print.taxInvoice") : t("print.receipt")
        } #${invoice.id}</title>
        <style>
          @page {
            margin: 8mm;
            size: A4 portrait;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          * {
            box-sizing: border-box;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            font-size: 12px;
            line-height: 1.4;
            color: #333;
          }
          .invoice-container { 
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          /* Header Section */
          .invoice-header { 
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #5e5e5e;
          }
          .company-logo-section h1 { 
            font-size: 28px; 
            margin: 0; 
            color: #5e5e5e;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .company-logo-section p {
            margin: 5px 0 0 0;
            font-size: 14px;
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
            color: #5e5e5e;
            margin: 0 0 5px 0;
          }
          .invoice-number .bill-label,
          .invoice-number .bill-id {
            font-size: inherit;
            font-weight: inherit;
            color: inherit;
          }
          .invoice-date {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
          }
          
          /* Business Info Section */
          .business-info-section {
            background: #fafbfc;
            padding: 9px 11px;
            border-radius: 8px;
            margin-bottom: 12px;
            border-left: 4px solid #5e5e5e;
          }
          .business-info-section h3 {
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
            color: #5e5e5e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .business-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          .full-width {
            grid-column: 1 / -1;
          }
          .business-details p {
            margin: 1px 0;
            font-size: 12px;
            line-height: 1.1;
          }
          .business-info-section h3 { margin: 0 0 8px 0; }
          .business-details strong {
            color: #374151;
            font-weight: 600;
          }
          
          /* Billing Section */
          .billing-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .billing-section {
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background-color: #fafbfc;
          }
          .billing-section h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: 600;
            color: #5e5e5e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .billing-section p {
            margin: 4px 0;
            font-size: 12px;
            line-height: 1.3;
          }
          .customer-name {
            font-weight: 600;
            color: #111827;
            font-size: 14px !important;
          }
          .payment-status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 8px;
          }
          .status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
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
            margin-bottom: 20px;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .items-table th { 
            background: #5e5e5e;
            color: white; 
            padding: 12px 10px;
            font-size: 12px; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border: none;
          }
          .items-table td { 
            padding: 12px 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
            background-color: #fafbfc;
          }
          .items-table tbody tr:last-child td {
            border-bottom: none;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-medium { font-weight: 500; }
          .font-bold { font-weight: 600; }
          
          /* Summary Section */
          .summary-section { 
            margin-bottom: 20px;
          }
          .summary-table {
            width: 100%;
            max-width: 350px;
            margin-left: auto;
          }
          .summary-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 1px solid #f3f4f6;
          }
          .summary-row:last-child {
            border-bottom: none;
          }
          .summary-row.subtotal {
            color: #6b7280;
          }
          .summary-row.discount {
            color: #6b7280;
          }
          .summary-row.tax {
            color: #6b7280;
          }
          .summary-row.total { 
            border-top: 2px solid #5e5e5e;
            margin-top: 8px;
            padding-top: 12px;
            font-weight: 700;
            font-size: 16px;
            color: #5e5e5e;
          }
          .summary-label {
            font-weight: 500;
          }
          .summary-amount {
            font-weight: 600;
            min-width: 100px;
            text-align: right;
          }
          
          /* Notes and Summary Side by Side Container */
          .notes-summary-container {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }
          .notes-section {
            flex: 1;
            width: 50%;
          }
          .notes-section .note-section {
            margin-bottom: 0;
          }
          .summary-section {
            flex: 1;
            width: 50%;
            margin-bottom: 0;
          }
          
          /* Note Section */
          .note-section {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
            border-left: 3px solid #5e5e5e;
          }
          .note-section h3 {
            color: #374151;
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .note-section p {
            color: #6b7280;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
          }
          
          /* Footer */
          .invoice-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .thank-you {
            font-style: italic;
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
          }
          .generated-info {
            font-size: 10px;
            color: #9ca3af;
            text-align: right;
          }
          
          /* Signature Section */
          .signature-section {
            margin: 30px 0;
            padding: 20px 0;
            border-top: 1px solid #e5e7eb;
          }
          .signature-row {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: stretch;
            width: 100%;
            gap: 10px;
            margin-top: 20px;
          }
          .signature-block {
            flex: 1;
            min-width: 0;
            max-width: 180px;
            text-align: center;
            min-height: 60px;
            margin: 0 auto;
          }
          .signature-label {
            font-size: 10px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .signature-line {
            border-bottom: 1px solid #6b7280;
            height: 50px;
            margin-bottom: 6px;
            position: relative;
          }
          .signature-name {
            font-size: 9px;
            color: #6b7280;
            margin-bottom: 3px;
          }
          .signature-date {
            font-size: 8px;
            color: #9ca3af;
          }
          .business-stamp {
            border: 2px dashed #9ca3af;
            border-radius: 6px;
            opacity: 0.5;
            padding: 10px;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #fafbfc;
          }
          .stamp-text {
            font-size: 8px;
            color: #9ca3af;
            text-align: center;
            font-style: italic;
          }
          
          /* Mobile Responsive */
          @media (max-width: 768px) {
            .invoice-container {
              padding: 10px;
            }
            /* Keep header side by side on mobile */
            .invoice-header {
              flex-direction: row;
              text-align: left;
              gap: 10px;
            }
            .invoice-meta {
              text-align: left;
              min-width: auto;
            }
            .company-logo-section h1 {
              font-size: 24px;
            }
            .billing-info {
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .items-table th,
            .items-table td {
              padding: 8px 6px;
              font-size: 11px;
            }
            .summary-table {
              max-width: 100%;
            }
            .invoice-footer {
              flex-direction: column;
              gap: 10px;
              text-align: center;
            }
            .generated-info {
              text-align: center;
            }
            
            /* Signature Section */
            .signature-grid {
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .signature-block {
              min-height: 80px;
            }
            .signature-line {
              height: 50px;
            }
          }
          
          /* Print Optimizations */
          @media print {
            .invoice-container {
              max-width: 100%;
              padding: 10px;
            }
            .invoice-header {
              page-break-inside: avoid;
            }
            .business-info-section {
              page-break-inside: avoid;
            }
            .billing-info {
              page-break-inside: avoid;
            }
            .items-table {
              page-break-inside: avoid;
            }
            .summary-section {
              page-break-inside: avoid;
            }
            .invoice-footer {
              page-break-inside: avoid;
            }
            .signature-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="invoice-header">
            <div class="company-logo-section" style="display: flex; align-items: center; height: 100%;">
              <h1 style="padding-top: 20px; margin: 0 auto; text-align: center; width: 100%;">${
                isVatRegistered ? t("print.taxInvoice") : t("print.receipt")
              }</h1>
              <p style="text-align:center; margin:4px 0 0 0; font-size:12px; color:#6b7280;">(${t(
                "print.original"
              )})</p>
            </div>
            <div class="invoice-meta" style="display: flex; flex-direction: column; align-items: flex-end; justify-content: flex-end;">
              <div class="invoice-number"><span class="bill-label">${t(
                "print.billNo")}</span> 
                <span class="bill-id">${invoice.billId}</span></div>
              <p style="margin-top: 1px;">REF:${invoice.quotationId}, ${invoice.invoiceId}</p>            
                
                <p style="margin-top: 1px;">${(() => {
                  const d = new Date(invoice.updatedAt);
                  if (isNaN(d.getTime())) return "";
                  const dd = String(d.getDate()).padStart(2, "0");
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const yyyy = d.getFullYear();
                  return `${dd}/${mm}/${yyyy}`;
                })()}</p>
            </div>
          </div>

          <!-- Business Information -->
          <div class="business-info-section">
            <h3>${
              businessDetails?.taxType === "Juristic"
                ? t("print.companyInformation")
                : t("print.storeInformation")
            }</h3>
            <div class="business-details">
              <div>
                  <p><strong>${
                    businessDetails?.taxType === "Juristic"
                      ? t("print.companyName")
                      : t("print.storeName")
                  }:</strong> ${
    (businessDetails?.businessName || businessName || "Your Business Name") +
    (businessDetails?.branch ? ` (${businessDetails.branch})` : "")
  }</p>
              </div>
              <div>
                  <p><strong>${t("print.taxId")}:</strong> ${
    businessDetails?.taxId || t("print.notSpecified")
  }</p>
              </div>
              <div class="full-width">
                  <p><strong>${t("print.address")}:</strong> ${
    [
      businessDetails?.businessAddress,
      businessDetails?.businessSubDistrict,
      businessDetails?.businessDistrict,
      businessDetails?.businessProvince,
      businessDetails?.businessPostId,
    ]
      .filter(Boolean)
      .join(", ") || t("print.notSpecified")
  }
                  </p>
              </div>
              <div>
                  <p><strong>${t("print.contact")}:</strong> ${
    businessDetails?.businessPhone || t("print.notSpecified")
  }</p>
              </div>
            </div>
          </div>

          <!-- Customer Information (Billing) - duplicated style -->
          <div class="business-info-section">
            <h3>${t("print.customerInformation")}</h3>
            <div class="business-details">
              <div>
                <p><strong>${t("print.customerName")}:</strong> ${
    invoice.cName || ""
  } ${invoice.cLastName || ""}${
    invoice.cBranch ? ` (${invoice.cBranch})` : ""
  }</p>
              </div>
              <div>
                <p><strong>${t("print.taxId")}:</strong> ${
    invoice.cTaxId || t("print.notSpecified")
  }</p>
              </div>
              <div class="full-width">
                <p><strong>${t("print.address")}:</strong> ${
    [invoice.cAddress, invoice.cProvince, invoice.cPostId]
      .filter(Boolean)
      .join(", ") || t("print.addressNotProvided")
  }</p>
              </div>
              <div>
                <p><strong>${t("print.contact")}:</strong> ${
    invoice.cPhone || t("print.notSpecified")
  }</p>
              </div>
            </div>
          </div>

          <!-- Billing Information -->
            <!-- Billing Information removed: content consolidated into customer/business sections -->

          <!-- Items Table (multi-product) -->
          <div class="items-section">
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 8%;">${t("print.no")}</th>
                  <th style="width: 32%;">${t("print.productName")}</th>
                  <th style="width: 10%;">${t("print.quantity")}</th>
                  <th style="width: 10%;">${t("product.unitTitle")}</th>
                  <th style="width: 15%;">${t("print.unitPrice")}</th>
                  <th style="width: 10%;">${t("print.discount")}</th>
                  <th style="width: 15%;">${t("print.total")}</th>
                </tr>
              </thead>
              <tbody>
                ${productItems
                  .map(
                    (item: any, idx: number) => `
                  <tr>
                    <td class="text-center font-medium">${idx + 1}</td>
                    <td class="font-medium">${item.product || "-"}</td>
                    <td class="text-center">
                      ${item.unit ? t(`product.unit.${item.unit}`) : "-"}
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCurrencyForPDF(
                      item.unitPrice
                    )}</td>
                      <td class="text-right">${
                        item.unitDiscount
                          ? `${formatCurrencyForPDF(item.unitDiscount)}`
                          : "-"
                      }</td>
                    <td class="text-right font-bold">${formatCurrencyForPDF(
                      item.unitPrice * item.quantity -
                        (item.unitDiscount || 0) * item.quantity
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

           <!-- Terms and Summary Stacked -->
          <div class="terms-summary-container" style="margin-bottom: 20px;">
            <!-- Summary -->
            <div class="summary-section" style="width: 100%; margin-bottom: 20px;">
              <div class="summary-table">
                ${
                  isVatRegistered
                    ? `${
                        totalDiscount > 0
                          ? `
                <div class="summary-row discount">
                  <span class="summary-label">${
                    t("print.totalDiscount") || "Total Discount"
                  }:</span>
                  <span class="summary-amount">-${formatCurrencyForPDF(
                    totalDiscount
                  )}</span>
                </div>`
                          : ""
                      }
                <div class="summary-row subtotal">
                  <span class="summary-label">${t("print.subtotal")}</span>
                  <span class="summary-amount">${formatCurrencyForPDF(
                    subTotal
                  )}</span>
                </div>
                <div class="summary-row tax">
                  <span class="summary-label">${t("print.vat")} (7%)</span>
                  <span class="summary-amount">${formatCurrencyForPDF(
                    vatTotal
                  )}</span>
                </div>`
                    : `${
                        totalDiscount > 0
                          ? `
                <div class="summary-row discount">
                  <span class="summary-label">${
                    t("print.totalDiscount") || "Total Discount"
                  }:</span>
                  <span class="summary-amount">-${formatCurrencyForPDF(
                    totalDiscount
                  )}</span>
                </div>`
                          : ""
                      }
                <div class="summary-row subtotal">
                  <span class="summary-label">${t("print.subtotal")}</span>
                  <span class="summary-amount">${formatCurrencyForPDF(
                    subTotal
                  )}</span>
                </div>`
                }
                <div class="summary-row total">
                  <span class="summary-label">${t("print.grandTotal")}</span>
                  <span class="summary-amount">${formatCurrencyForPDF(
                    grandTotal
                  )}</span>
                </div>
              </div>
            </div>

            <!-- Payment Terms and Conditions -->
            <div class="terms-section" style="width: 100%; margin-bottom: 0;">
              <div class="note-section">
                <h3>${t("print.termsAndConditions")}</h3>
                <p>
                  ${invoice.remark ? `• ${invoice.remark}` : ""}                  
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="signature-section" style="margin-bottom:0; padding-bottom:0;">
            <div class="signature-row" style="display: flex; flex-direction: row; justify-content: space-between; align-items: stretch; width: 100%; gap: 10px; margin-top: 20px;">
              <div class="signature-block" style="flex: 1; min-width: 0; max-width: 180px; text-align: center; min-height: 60px; margin: 0 auto;">
                <div class="signature-label">${t("print.authorizedBy")}</div>
                <div class="signature-line"></div>
                <div class="signature-name"> ${
                  businessDetails?.businessName || businessName
                } </div>

<div class="signature-date">${t("print.date")}: ${formatDate(
    invoice.purchaseAt
  )}</div>

              </div>
              <div class="signature-block" style="flex: 1; min-width: 0; max-width: 180px; text-align: center; min-height: 60px; margin: 0 auto;">            
              <div class="business-stamp">
                  <div class="stamp-text">${t("print.sellerStampHere")}</div>
                </div>
              </div>
              <div class="signature-block" style="flex: 1; min-width: 0; max-width: 180px; text-align: center; min-height: 60px; margin: 0 auto;">
                <div class="signature-label">${t("print.receivedBy")}</div>
                <div class="signature-line"></div>
                <div class="signature-name"> ${invoice.cName} ${
    invoice.cLastName
  } </div>
                <div class="signature-date">${t(
                  "print.date"
                )}: _______________</div>
              </div>
              <div class="signature-block" style="flex: 1; min-width: 0; max-width: 180px; text-align: center; min-height: 60px; margin: 0 auto;">               
                <div class="business-stamp">
                  <div class="stamp-text">${t("print.customerStampHere")}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="invoice-footer">           
            <div class="generated-info">
              ${t("print.generatedOn")} 
              Flexi Business Hub
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
