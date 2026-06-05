import { formatIDR, formatShortDateID } from "@/components/features/billing/billing-format";
import type { PaymentDTO } from "@/types/wallet.md";

export function generateReceiptHTML(payment: PaymentDTO): string {
  const receiptNumber = payment.xenditExternalId;
  const date = new Date(payment.createdAt);
  const formattedDate = date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const paymentType = payment.type === "TOPUP" ? "Top Up Saldo" : "Langganan Paket";
  const planName =
    payment.type === "TOPUP" ? "Saldo Akun" : payment.plan;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - ${receiptNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        .receipt-header {
            background: linear-gradient(135deg, #a4d730 0%, #8fb01f 100%);
            color: #141f00;
            padding: 32px 24px;
            text-align: center;
        }
        .receipt-header h1 {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .receipt-header p {
            font-size: 12px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        .receipt-content {
            padding: 32px 24px;
        }
        .receipt-section {
            margin-bottom: 24px;
        }
        .receipt-section-title {
            font-size: 10px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            display: block;
        }
        .receipt-detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
        }
        .receipt-detail-label {
            color: #666;
            font-weight: 500;
        }
        .receipt-detail-value {
            color: #141f00;
            font-weight: 600;
            text-align: right;
        }
        .receipt-amount {
            border-top: 2px solid #e0e0e0;
            border-bottom: 2px solid #e0e0e0;
            padding: 16px 0;
            margin: 24px 0;
        }
        .receipt-amount-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .receipt-amount-label {
            font-size: 14px;
            color: #666;
        }
        .receipt-amount-value {
            font-size: 28px;
            font-weight: bold;
            color: #141f00;
        }
        .receipt-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 8px;
        }
        .receipt-status.paid {
            background: rgba(34, 197, 94, 0.15);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .receipt-status.pending {
            background: rgba(107, 114, 128, 0.15);
            color: #6b7280;
            border: 1px solid rgba(107, 114, 128, 0.3);
        }
        .receipt-status.failed {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .receipt-divider {
            border-top: 1px dashed #e0e0e0;
            margin: 24px 0;
        }
        .receipt-footer {
            text-align: center;
            padding-top: 16px;
            font-size: 12px;
            color: #999;
        }
        .receipt-footer p {
            margin-bottom: 8px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .receipt-container {
                box-shadow: none;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <h1>✓ TANDA TERIMA</h1>
            <p>Chatly Payment Receipt</p>
        </div>

        <div class="receipt-content">
            <div class="receipt-section">
                <span class="receipt-section-title">Nomor Transaksi</span>
                <div class="receipt-detail-value" style="font-size: 16px; font-family: monospace;">${receiptNumber}</div>
            </div>

            <div class="receipt-section">
                <span class="receipt-section-title">Tanggal & Waktu</span>
                <div class="receipt-detail-row">
                    <span class="receipt-detail-label">Tanggal</span>
                    <span class="receipt-detail-value">${formattedDate}</span>
                </div>
                <div class="receipt-detail-row">
                    <span class="receipt-detail-label">Waktu</span>
                    <span class="receipt-detail-value">${formattedTime}</span>
                </div>
            </div>

            <div class="receipt-section">
                <span class="receipt-section-title">Detail Pembayaran</span>
                <div class="receipt-detail-row">
                    <span class="receipt-detail-label">Tipe Transaksi</span>
                    <span class="receipt-detail-value">${paymentType}</span>
                </div>
                <div class="receipt-detail-row">
                    <span class="receipt-detail-label">Deskripsi</span>
                    <span class="receipt-detail-value">${planName}</span>
                </div>
                ${
                  payment.businessName
                    ? `<div class="receipt-detail-row">
                    <span class="receipt-detail-label">Bisnis</span>
                    <span class="receipt-detail-value">${payment.businessName}</span>
                </div>`
                    : ""
                }
            </div>

            <div class="receipt-amount">
                <div class="receipt-amount-row">
                    <span class="receipt-amount-label">Jumlah Pembayaran</span>
                    <span class="receipt-amount-value">${formatIDR(payment.amount)}</span>
                </div>
                <div class="receipt-status ${payment.status.toLowerCase()}">
                    ${
                      payment.status === "PAID"
                        ? "✓ BERHASIL"
                        : payment.status === "PENDING"
                          ? "⏳ MENUNGGU"
                          : "✗ GAGAL"
                    }
                </div>
            </div>

            ${
              payment.status === "PAID"
                ? `<div class="receipt-section">
                <span class="receipt-section-title">Tanggal Pembayaran</span>
                <div class="receipt-detail-row">
                    <span class="receipt-detail-label">Dibayar</span>
                    <span class="receipt-detail-value">${
                      payment.paidAt
                        ? new Date(payment.paidAt).toLocaleDateString("id-ID")
                        : "-"
                    }</span>
                </div>
            </div>`
                : ""
            }

            <div class="receipt-divider"></div>

            <div class="receipt-footer">
                <p>Terima kasih telah mempercayai Chatly</p>
                <p>© 2026 Chatly - Your AI Customer Service Assistant</p>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}

export function downloadReceipt(payment: PaymentDTO): void {
  const html = generateReceiptHTML(payment);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Receipt-${payment.xenditExternalId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
