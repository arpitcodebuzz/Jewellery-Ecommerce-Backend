import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateAndSaveInvoicePdf({
  invoice,
  baseUrl,
  fileName,
}) {
  const invoicesDir = path.join(process.cwd(), "public", "invoices");

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fullPath = path.join(invoicesDir, fileName);
  const publicUrl = `${baseUrl}/public/invoices/${fileName}`;

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    const stream = fs.createWriteStream(fullPath);
    doc.pipe(stream);

    const currency = "INR";
const money = (n) => `${currency} ${Number(n ?? 0).toFixed(2)}`;

    // =========================================
    // 🔥 HEADER (Dark Luxury Theme)
    // =========================================

    doc.rect(0, 0, 595, 140).fill("#0B1220");

    doc
      .fillColor("#F5D48A")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("RV Jewellery", 40, 40);

    doc
      .fillColor("#ffffff")
      .fontSize(11)
      .font("Helvetica")
      .text("Timeless Elegance • Trusted Purity", 40, 70);

    doc
      .fillColor("#ffffff")
      .fontSize(10)
      .text(`Invoice No: ${invoice.invoiceNumber}`, 380, 50)
      .text(`Order No: ${invoice.orderNumber}`, 380, 65)
      .text(`Date: ${invoice.invoiceDateText}`, 380, 80);

    // =========================================
    // CUSTOMER SECTION
    // =========================================

    doc.rect(40, 160, 515, 90).stroke("#E5E7EB");

    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Billed To", 50, 170);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#374151")
      .text(invoice.customer.name, 50, 190)
      .text(invoice.customer.email || "", 50, 205);

    doc
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .text("Shipping Address", 300, 170);

    doc
      .font("Helvetica")
      .fillColor("#374151")
      .text(invoice.shipping.name, 300, 190)
      .text(invoice.shipping.address1, 300, 205)
      .text(`${invoice.shipping.city} - ${invoice.shipping.pincode}`, 300, 220);

    // =========================================
    // ITEMS HEADER
    // =========================================

    let y = 280;

    doc
      .font("Helvetica-Bold")
      .fillColor("#111827")
      .fontSize(11)
      .text("Item", 50, y)
      .text("Qty", 360, y)
      .text("Price", 420, y)
      .text("Total", 480, y);

    doc.moveTo(50, y + 15).lineTo(545, y + 15).stroke("#E5E7EB");

    y += 25;

    // =========================================
    // ITEMS
    // =========================================

    doc.font("Helvetica").fontSize(10);

    for (const item of invoice.items) {
      const total = item.qty * item.unitPrice;

      doc
        .fillColor("#111827")
        .text(item.name, 50, y)
        .text(item.qty, 360, y)
        .text(money(item.unitPrice), 420, y)
        .text(money(total), 480, y);

      y += 20;

      if (y > 700) {
        doc.addPage();
        y = 60;
      }
    }
// =========================================
// TOTAL SECTION (Right after items)
// =========================================

// spacing after items
y += 18;

// totals box size i want as item has fixed size
const boxW = 520;
const boxH = 110;

// place at right side, aligned after items
let boxX = 595 - 40 - boxW; // right margin 40
let boxY = y;

// if totals would go beyond bottom, push it to next page
const bottomLimit = 842 - 60; // keep footer space
if (boxY + boxH > bottomLimit) {
  doc.addPage();
  boxY = 80; // top margin on new page
}

// draw box
doc
  .roundedRect(boxX, boxY, boxW, boxH, 12)
  .fillAndStroke("#FAF9F6", "#EBE6DA");

// positions inside box
const labelX = boxX + 14;
const valueX = boxX + 14;
const valueW = boxW - 28;

const row1 = boxY + 16;
const rowGap = 18;

const subtotal = Number(invoice.totals?.subtotal ?? 0);
const gst = Number(invoice.totals?.gst ?? 0);
const shippingFee = Number(invoice.totals?.shippingFee ?? 0);
const discount = Number(invoice.totals?.discount ?? 0);
const grandTotal = Number(
  invoice.totals?.total ?? (subtotal + gst + shippingFee - discount)
);

doc.fontSize(10).font("Helvetica").fillColor("#6B7280");
doc.text("Subtotal", labelX, row1);
doc.text("GST", labelX, row1 + rowGap);
doc.text("Shipping", labelX, row1 + rowGap * 2);
if (discount > 0) doc.text("Discount", labelX, row1 + rowGap * 3);

doc.fillColor("#111827");
doc.text(money(subtotal), valueX, row1, { width: valueW, align: "right" });
doc.text(money(gst), valueX, row1 + rowGap, { width: valueW, align: "right" });
doc.text(money(shippingFee), valueX, row1 + rowGap * 2, { width: valueW, align: "right" });
if (discount > 0) doc.text(`- ${money(discount)}`, valueX, row1 + rowGap * 3, { width: valueW, align: "right" });

// divider
const dividerY = discount > 0 ? row1 + rowGap * 4 - 6 : row1 + rowGap * 3 - 6;
doc
  .moveTo(boxX + 14, dividerY)
  .lineTo(boxX + boxW - 14, dividerY)
  .strokeColor("#D1D5DB")
  .stroke();

// total row
doc.font("Helvetica-Bold").fillColor("#111827");
doc.text("Total", labelX, dividerY + 10);
doc.text(money(grandTotal), valueX, dividerY + 10, { width: valueW, align: "right" });

// move y below totals if you want to continue printing after it
y = boxY + boxH + 20;

    // =========================================
    // FOOTER
    // =========================================

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#9CA3AF")
      .text("Thank you for shopping with RV Jewellery.", 40, 800)
      .text("This invoice is generated electronically and does not require a signature.", 40, 815);

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return { filePath: fullPath, publicUrl };
}