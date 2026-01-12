export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  userId: string;
  userDetails: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    type: 'course' | 'book' | 'material' | 'test';
    itemId: string;
    title: string;
    price: number;
  }>;
  totalAmount: number;
  paymentDetails: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    paymentMethod?: string;
    paidAt: Date;
  };
  createdAt: Date;
}

export interface Invoice {
  invoiceNumber: string;
  orderId: string;
  userId: string;
  data: InvoiceData;
  htmlContent: string;
  createdAt: Date;
}

/**
 * Generate unique invoice number
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-6);
  
  return `CPI-${year}${month}-${timestamp}`;
}

/**
 * Generate invoice HTML content
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  const formatDate = (date: Date) => date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${data.invoiceNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 5px;
        }
        .invoice-title {
            font-size: 20px;
            margin: 20px 0;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .invoice-info, .customer-info {
            flex: 1;
        }
        .customer-info {
            margin-left: 40px;
        }
        .info-label {
            font-weight: bold;
            color: #666;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .items-table .price-col {
            text-align: right;
        }
        .total-section {
            text-align: right;
            margin-bottom: 30px;
        }
        .total-row {
            margin: 5px 0;
        }
        .grand-total {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #007bff;
            padding-top: 10px;
        }
        .payment-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .capitalize {
            text-transform: capitalize;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">Career Path Institute</div>
        <div>Learning Management System</div>
        <div class="invoice-title">INVOICE</div>
    </div>

    <div class="invoice-details">
        <div class="invoice-info">
            <div><span class="info-label">Invoice Number:</span> ${data.invoiceNumber}</div>
            <div><span class="info-label">Order ID:</span> ${data.orderId}</div>
            <div><span class="info-label">Invoice Date:</span> ${formatDate(data.createdAt)}</div>
            <div><span class="info-label">Payment Date:</span> ${formatDate(data.paymentDetails.paidAt)}</div>
        </div>
        <div class="customer-info">
            <div><span class="info-label">Bill To:</span></div>
            <div>${data.userDetails.name}</div>
            <div>${data.userDetails.email}</div>
            ${data.userDetails.phone ? `<div>${data.userDetails.phone}</div>` : ''}
            ${data.userDetails.address ? `<div>${data.userDetails.address}</div>` : ''}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Type</th>
                <th class="price-col">Amount</th>
            </tr>
        </thead>
        <tbody>
            ${data.items.map(item => `
                <tr>
                    <td>${item.title}</td>
                    <td class="capitalize">${item.type}</td>
                    <td class="price-col">${formatCurrency(item.price)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="total-section">
        <div class="total-row">
            <strong>Subtotal: ${formatCurrency(data.totalAmount)}</strong>
        </div>
        <div class="total-row">
            Tax: ₹0.00
        </div>
        <div class="total-row grand-total">
            <strong>Total: ${formatCurrency(data.totalAmount)}</strong>
        </div>
    </div>

    <div class="payment-info">
        <div><span class="info-label">Payment Information:</span></div>
        <div>Payment ID: ${data.paymentDetails.razorpayPaymentId}</div>
        <div>Order ID: ${data.paymentDetails.razorpayOrderId}</div>
        ${data.paymentDetails.paymentMethod ? `<div>Payment Method: ${data.paymentDetails.paymentMethod}</div>` : ''}
        <div>Status: Paid</div>
    </div>

    <div class="footer">
        <p>Thank you for your purchase!</p>
        <p>Career Path Institute - Shimla</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
    </div>
</body>
</html>
  `.trim();
}

/**
 * Create invoice from order data
 */
export function createInvoice(
  orderId: string,
  userId: string,
  userDetails: InvoiceData['userDetails'],
  items: InvoiceData['items'],
  totalAmount: number,
  paymentDetails: InvoiceData['paymentDetails']
): Invoice {
  const invoiceNumber = generateInvoiceNumber();
  const createdAt = new Date();

  const invoiceData: InvoiceData = {
    invoiceNumber,
    orderId,
    userId,
    userDetails,
    items,
    totalAmount,
    paymentDetails,
    createdAt,
  };

  const htmlContent = generateInvoiceHTML(invoiceData);

  return {
    invoiceNumber,
    orderId,
    userId,
    data: invoiceData,
    htmlContent,
    createdAt,
  };
}
