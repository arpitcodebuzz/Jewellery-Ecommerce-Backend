import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { generateAndSaveInvoicePdf } from "./invoice.storage.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const LOGO_URL =
  "https://www.onlinelogomaker.com/blog/wp-content/uploads/2017/08/jewelry-logo.jpg";

export const sendOtpEmail = async (to, otp, purpose = "Verification") => {
  const purposeText = String(purpose).replaceAll("_", " ");

  const mailOptions = {
    from: `"RV Jewellery" <${process.env.EMAIL}>`,
    to,
    subject: `Your RV Jewellery OTP for ${purposeText}`,
    html: `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#f6f7fb;">
    <div style="
      margin:0;
      padding:28px 14px;
      background:#f6f7fb;
      font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
      color:#111827;
    ">

      <div style="
        max-width:560px;
        margin:0 auto;
        border-radius:18px;
        overflow:hidden;
        border:1px solid #efe7d7;
        box-shadow: 0 18px 50px rgba(17,24,39,0.10);
        background:#ffffff;
      ">

        <!-- HEADER (Plain Premium Dark) -->
        <div style="
          padding:26px;
          background: linear-gradient(135deg, #0b1220 0%, #111827 100%);
          color:#ffffff;
        ">
          <div style="display:flex; align-items:center; gap:12px;">
            
            <img
              src="${LOGO_URL}"
              width="44"
              height="44"
              alt="RV Jewellery"
              style="
                width:44px; height:44px;
                border-radius:12px;
                display:block;
                background:#ffffff;
                padding:6px;
              "
            />

            <div>
              <div style="
                font-size:18px;
                letter-spacing:0.6px;
                font-weight:800;
                margin-left:10px;
              ">
                RV Jewellery
              </div>

              <div style="
                font-size:12px;
                color:rgba(255,255,255,0.75);
                margin-top:2px;
              ">
                Secure One-Time Password
              </div>
            </div>
          </div>

          <div style="
            margin-top:16px;
            font-size:14px;
            color:rgba(255,255,255,0.85);
            line-height:1.6;
          ">
            Use the OTP below to complete your
            <strong style="color:#f5d48a;">${purposeText}</strong>.
            This code helps protect your account.
          </div>
        </div>

        <!-- BODY -->
        <div style="padding:26px 26px 12px 26px;">
          <div style="font-size:14px; color:#374151; line-height:1.65;">
            Hi there, ✨<br/>
            Enter this one-time password to continue on <strong>RV Jewellery</strong>.
          </div>

          <!-- OTP BOX -->
          <div style="
            margin:22px 0 14px 0;
            border-radius:16px;
            padding:20px 16px;
            background:#faf9f6;
            border:1px solid #efe7d7;
            text-align:center;
          ">
            <div style="
              font-size:12px;
              color:#6b7280;
              letter-spacing:0.6px;
              text-transform:uppercase;
            ">
              Your OTP
            </div>

            <div style="
              margin-top:10px;
              font-size:36px;
              font-weight:900;
              letter-spacing:10px;
              color:#111827;
            ">
              ${otp}
            </div>
          </div>

          <div style="font-size:13px; color:#6b7280; line-height:1.6;">
            ⏳ This OTP is valid for <strong style="color:#111827;">5 minutes</strong>.
            If you didn’t request this, you can safely ignore this email.
          </div>

          <div style="margin-top:18px; height:1px; background:#f1f5f9;"></div>

          <div style="margin-top:14px; font-size:12px; color:#9ca3af; line-height:1.6;">
            For your security, do not share this code with anyone — including RV Jewellery staff.
          </div>
        </div>

        <!-- FOOTER -->
        <div style="padding:14px 26px 22px 26px; background:#ffffff;">
          <div style="font-size:12px; color:#9ca3af; text-align:center;">
            © ${new Date().getFullYear()} RV Jewellery. All rights reserved.
          </div>
        </div>

      </div>

      <div style="
        max-width:560px;
        margin:12px auto 0 auto;
        font-size:11px;
        color:#9ca3af;
        text-align:center;
      ">
        This is an automated message. Please do not reply.
      </div>

    </div>
  </body>
</html>
    `,
  };

  return transporter.sendMail(mailOptions);
};









/**
 * Modern Welcome Email (send after account creation)
 * @param {string} to
 * @param {string} name
 */
export const sendWelcomeEmail = async (to, name = "there") => {
  // ✅ Replace with your own hosted images later for best deliverability/performance
  const HERO_IMG =
    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1400&q=80";
const IMG_1 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZX50Y1KWBfPsrIpd6U1MiekIEkJ0jl1hdZA&s"; // necklace-like
const IMG_2 =
  "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=900&q=80"; // rings
const IMG_3 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFsN8NrfCYyHrbB5RomfCye0Fn5Gm6fz1rtA&s"; // earrings-like

  const EXPLORE_URL = "https://example.com"; // change later
  const SUPPORT_EMAIL = "support@rvjewellery.com"; // change later

  const subject = "Welcome to RV Jewellery ✨";

  const html = `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#f4f5f7;">
    <!-- Preheader (hidden preview line) -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      Your RV Jewellery account is ready. Explore timeless pieces crafted to shine every day.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7; padding:28px 14px;">
      <tr>
        <td align="center">

          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="
            width:600px; max-width:600px;
            background:#ffffff;
            border-radius:22px;
            overflow:hidden;
            border:1px solid #ebe6da;
            box-shadow: 0 18px 60px rgba(17,24,39,0.12);
            font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
            color:#111827;
          ">

            <!-- Top Bar -->
            <tr>
              <td style="padding:18px 22px; background:#0b1220;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="
                        font-size:16px;
                        font-weight:900;
                        letter-spacing:0.6px;
                        color:#ffffff;
                      ">RV Jewellery</div>
                      <div style="
                        font-size:12px;
                        color:rgba(255,255,255,0.72);
                        margin-top:2px;
                        letter-spacing:0.3px;
                      ">Timeless pieces • Modern craft</div>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <div style="
                        font-size:12px;
                        color:rgba(245,212,138,0.95);
                        font-weight:800;
                        letter-spacing:0.4px;
                      ">WELCOME</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Hero -->
            <tr>
            </tr>

            <!-- Hero Overlay Card (modern look) -->
            <tr>
              <td style="padding:0 22px;">
                <div style="
                  margin-top:-26px;
                  background:#ffffff;
                  border-radius:18px;
                  border:1px solid #ebe6da;
                  box-shadow: 0 14px 45px rgba(17,24,39,0.10);
                  padding:18px 18px 16px 18px;
                ">
                  <div style="font-size:22px; font-weight:950; letter-spacing:0.2px;">
                    Welcome, ${name} ✨
                  </div>

                  <div style="margin-top:8px; font-size:14px; color:#374151; line-height:1.75;">
                    Your RV Jewellery account is ready.
                    Discover pieces designed to elevate daily elegance — and shine on your biggest moments.
                  </div>

                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:14px;">
                    <tr>
                      <td>
                        <a href="${EXPLORE_URL}" style="
                          display:inline-block;
                          text-decoration:none;
                          background: linear-gradient(135deg, #f5d48a 0%, #caa24a 100%);
                          color:#111827;
                          font-weight:950;
                          font-size:14px;
                          padding:12px 16px;
                          border-radius:14px;
                          border:1px solid rgba(17,24,39,0.10);
                        ">Explore Collections →</a>
                      </td>
                      <td style="padding-left:12px;">
                        <span style="font-size:12px; color:#6b7280;">
                          New drops & best sellers updated weekly
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <!-- Modern Feature Pills -->
            <tr>
              <td style="padding:16px 22px 4px 22px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:10px 10px; border:1px solid #ebe6da; border-radius:16px; background:#faf9f6;">
                      <div style="font-size:12px; color:#111827; font-weight:900;">Premium Finish</div>
                      <div style="font-size:12px; color:#6b7280; margin-top:2px;">Modern detailing & polish</div>
                    </td>
                    <td width="10"></td>
                    <td style="padding:10px 10px; border:1px solid #ebe6da; border-radius:16px; background:#faf9f6;">
                      <div style="font-size:12px; color:#111827; font-weight:900;">Trusted Quality</div>
                      <div style="font-size:12px; color:#6b7280; margin-top:2px;">Crafted to last longer</div>
                    </td>
                    <td width="10"></td>
                    <td style="padding:10px 10px; border:1px solid #ebe6da; border-radius:16px; background:#faf9f6;">
                      <div style="font-size:12px; color:#111827; font-weight:900;">Curated Styles</div>
                      <div style="font-size:12px; color:#6b7280; margin-top:2px;">Daily to bridal looks</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Featured Picks -->
            <tr>
              <td style="padding:14px 22px 6px 22px;">
                <div style="font-size:14px; font-weight:950; color:#111827;">
                  Featured picks for you
                </div>
                <div style="margin-top:4px; font-size:12px; color:#6b7280;">
                  A quick glimpse of what customers love most.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:10px 22px 18px 22px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="33.33%" style="padding-right:6px;">
                      <img src="${IMG_1}" alt="Necklaces" width="100%" style="display:block; border-radius:16px; border:1px solid #ebe6da;" />
                      <div style="margin-top:8px; font-size:12px; font-weight:900; color:#111827;">Necklaces</div>
                      <div style="margin-top:2px; font-size:12px; color:#6b7280;">Elegant statement pieces</div>
                    </td>

                    <td width="33.33%" style="padding-left:3px; padding-right:3px;">
                      <img src="${IMG_2}" alt="Rings" width="100%" style="display:block; border-radius:16px; border:1px solid #ebe6da;" />
                      <div style="margin-top:8px; font-size:12px; font-weight:900; color:#111827;">Rings</div>
                      <div style="margin-top:2px; font-size:12px; color:#6b7280;">Minimal to iconic</div>
                    </td>

                    <td width="33.33%" style="padding-left:6px;">
                      <img src="${IMG_3}" alt="Earrings" width="100%" style="display:block; border-radius:16px; border:1px solid #ebe6da;" />
                      <div style="margin-top:8px; font-size:12px; font-weight:900; color:#111827;">Earrings</div>
                      <div style="margin-top:2px; font-size:12px; color:#6b7280;">Perfect for every outfit</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Bottom CTA -->
            <tr>
              <td style="padding:2px 22px 20px 22px;">
                <div style="padding:14px; border-radius:18px; background:#0b1220; color:#ffffff;">
                  <div style="font-size:14px; font-weight:950;">Ready to find your next favourite?</div>
                  <div style="margin-top:6px; font-size:12px; color:rgba(255,255,255,0.76); line-height:1.6;">
                    Browse collections, save items you love, and shop with confidence.
                  </div>

                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:12px;">
                    <tr>
                      <td>
                        <a href="${EXPLORE_URL}" style="
                          display:inline-block;
                          text-decoration:none;
                          background: linear-gradient(135deg, #f5d48a 0%, #caa24a 100%);
                          color:#111827;
                          font-weight:950;
                          font-size:14px;
                          padding:12px 16px;
                          border-radius:14px;
                        ">Start Exploring →</a>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:18px 22px 22px 22px; border-top:1px solid #f1f5f9;">
                <div style="font-size:12px; color:#6b7280; line-height:1.7;">
                  Need help? Contact
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:#111827; font-weight:900; text-decoration:none;">
                    ${SUPPORT_EMAIL}
                  </a>
                </div>
                <div style="margin-top:10px; font-size:12px; color:#9ca3af;">
                  © ${new Date().getFullYear()} RV Jewellery. All rights reserved.
                </div>
                <div style="margin-top:6px; font-size:11px; color:#9ca3af;">
                  This is an automated message. Please do not reply.
                </div>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  return transporter.sendMail({
    from: `"RV Jewellery" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
};







export const sendOrderPlacedEmail = async (payload) => {
  const {
    to,
    customerName = "there",
    orderNumber,
    orderDateText,
    trackUrl,
    shipping = {},
    items = [],
    totals = {},
  } = payload;

  const currency = totals.currencySymbol ?? "₹";

  const safe = (v) =>
    String(v ?? "").replace(/[<>&"]/g, (c) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
    }[c]));

  const money = (n) => {
    const num = Number(n ?? 0);
    return `${currency}${num.toFixed(2)}`;
  };

  const itemsHtml = items
    .map((it) => {
      const img = it.imageUrl
        ? `<img src="${safe(it.imageUrl)}" width="54" height="54" alt="" style="display:block;border-radius:12px;border:1px solid #ebe6da;object-fit:cover;" />`
        : `<div style="width:54px;height:54px;border-radius:12px;border:1px solid #ebe6da;background:#faf9f6;"></div>`;

      return `
        <tr>
          <td style="padding:10px 0; border-top:1px solid #f1f5f9;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td width="64" style="vertical-align:top;">
                  ${img}
                </td>
                <td style="vertical-align:top; padding-left:12px;">
                  <div style="font-size:13px; font-weight:900; color:#111827; line-height:1.35;">
                    ${safe(it.name)}
                  </div>
                  <div style="margin-top:4px; font-size:12px; color:#6b7280;">
                    SKU: ${safe(it.sku || "—")} • Qty: ${safe(it.qty)}
                  </div>
                </td>
                <td align="right" style="vertical-align:top;">
                  <div style="font-size:13px; font-weight:900; color:#111827;">
                    ${money(it.unitPrice)}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  const subject = `Order Placed ✅ ${orderNumber} • RV Jewellery`;

  const html = `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#f4f5f7;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      Your order ${safe(orderNumber)} has been placed successfully. Track your order anytime.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7; padding:28px 14px;">
      <tr>
        <td align="center">

          <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="
            width:620px; max-width:620px;
            background:#ffffff;
            border-radius:22px;
            overflow:hidden;
            border:1px solid #ebe6da;
            box-shadow: 0 18px 60px rgba(17,24,39,0.12);
            font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial;
            color:#111827;
          ">

            <tr>
              <td style="padding:20px 22px; background: linear-gradient(135deg,#0b1220 0%, #111827 100%); color:#fff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size:16px; font-weight:950; letter-spacing:0.6px;">RV Jewellery</div>
                      <div style="margin-top:3px; font-size:12px; color:rgba(255,255,255,0.75);">
                        Order Confirmation
                      </div>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <div style="
                        display:inline-block;
                        font-size:12px;
                        font-weight:900;
                        color:#111827;
                        background: linear-gradient(135deg,#f5d48a 0%, #caa24a 100%);
                        padding:8px 10px;
                        border-radius:999px;
                      ">
                        ORDER PLACED
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="margin-top:14px; font-size:14px; color:rgba(255,255,255,0.88); line-height:1.6;">
                  Hi ${safe(customerName)}, your order has been placed successfully.
                  We’ll notify you when it’s packed and shipped.
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 22px 6px 22px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:12px; border:1px solid #ebe6da; background:#faf9f6; border-radius:16px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <div style="font-size:12px; color:#6b7280; font-weight:900; letter-spacing:0.4px;">ORDER ID</div>
                            <div style="margin-top:4px; font-size:14px; font-weight:950; color:#111827;">${safe(orderNumber)}</div>
                          </td>
                          <td align="right">
                            <div style="font-size:12px; color:#6b7280; font-weight:900; letter-spacing:0.4px;">ORDER DATE</div>
                            <div style="margin-top:4px; font-size:14px; font-weight:950; color:#111827;">${safe(orderDateText || "—")}</div>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:12px;">
                        <tr>
                          <td>
                            <a href="${safe(trackUrl || "#")}" style="
                              display:inline-block;
                              text-decoration:none;
                              background:#0b1220;
                              color:#ffffff;
                              font-weight:950;
                              font-size:13px;
                              padding:11px 14px;
                              border-radius:14px;
                            ">Track Order →</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:10px 22px 0 22px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:top; padding-right:6px;">
                      <div style="padding:14px; border:1px solid #ebe6da; border-radius:16px; background:#ffffff;">
                        <div style="font-size:12px; color:#6b7280; font-weight:950; letter-spacing:0.4px;">SHIPPING TO</div>
                        <div style="margin-top:8px; font-size:13px; color:#111827; font-weight:900;">${safe(shipping.name || customerName)}</div>
                        <div style="margin-top:4px; font-size:12px; color:#6b7280; line-height:1.6;">
                          ${safe(shipping.address1)} ${shipping.address2 ? `, ${safe(shipping.address2)}` : ""}<br/>
                          ${safe(shipping.city)} - ${safe(shipping.pincode)}<br/>
                          ${safe(shipping.state)}${shipping.country ? `, ${safe(shipping.country)}` : ""}<br/>
                          ${shipping.phone ? `Phone: ${safe(shipping.phone)}` : ""}
                        </div>
                      </div>
                    </td>

                    <td style="vertical-align:top; padding-left:6px;">
                      <div style="padding:14px; border:1px solid #ebe6da; border-radius:16px; background:#ffffff;">
                        <div style="font-size:12px; color:#6b7280; font-weight:950; letter-spacing:0.4px;">PAYMENT & TOTAL</div>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;">
                          <tr>
                            <td style="font-size:12px; color:#6b7280; padding:3px 0;">Subtotal</td>
                            <td align="right" style="font-size:12px; color:#111827; font-weight:900; padding:3px 0;">${money(totals.subtotal)}</td>
                          </tr>
                          <tr>
                            <td style="font-size:12px; color:#6b7280; padding:3px 0;">GST</td>
                            <td align="right" style="font-size:12px; color:#111827; font-weight:900; padding:3px 0;">${money(totals.gst)}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top:8px;">
                              <div style="height:1px; background:#f1f5f9;"></div>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size:13px; color:#111827; font-weight:950; padding:8px 0;">Total</td>
                            <td align="right" style="font-size:13px; color:#111827; font-weight:950; padding:8px 0;">${money(totals.total)}</td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 22px 10px 22px;">
                <div style="font-size:14px; font-weight:950; color:#111827;">Items in your order</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:10px;">
                  ${itemsHtml}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 22px 22px 22px; border-top:1px solid #f1f5f9;">
                <div style="font-size:12px; color:#6b7280; line-height:1.7;">
                  Need help? Contact
                  <a href="mailto:${safe(process.env.SUPPORT_EMAIL || "support@rvjewellery.com")}"
                     style="color:#111827; font-weight:900; text-decoration:none;">
                    ${safe(process.env.SUPPORT_EMAIL || "support@rvjewellery.com")}
                  </a>
                </div>
                <div style="margin-top:10px; font-size:12px; color:#9ca3af;">
                  © ${new Date().getFullYear()} RV Jewellery. All rights reserved.
                </div>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
  `;

  return transporter.sendMail({
    from: `"RV Jewellery" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
};

  // (Optional but recommended)
  // Save publicUrl into orders.invoice_url column in DB

  // =====================================================
  // 🔽 SEND EMAIL WITH ATTACHMENT
  // =====================================================
