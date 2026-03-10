import crypto from "crypto";
import db from "../../common/config/db.js";
import { sendOrderPlacedEmail } from "../../common/utils/mailer.js";

export const verifyRazorpayPaymentService = async (payload) => {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = payload;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return {
      status: false,
      statusCode: 400,
      message: "Missing required payment verification fields",
      data: null,
    };
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return {
      status: false,
      statusCode: 400,
      message: "Invalid payment signature",
      data: null,
    };
  }

  const trx = await db.transaction();

  try {
    const payment = await trx("payments")
      .where({ order_id: orderId })
      .first();

    if (!payment) {
      await trx.rollback();
      return {
        status: false,
        statusCode: 404,
        message: "Payment record not found",
        data: null,
      };
    }

    if (payment.status === "success") {
      await trx.rollback();
      return {
        status: true,
        statusCode: 200,
        message: "Payment already verified",
        data: {
          order_id: Number(orderId),
          payment_status: payment.status,
          order_status: "confirmed",
        },
      };
    }

    await trx("payments")
      .where({ order_id: orderId })
      .update({
        status: "success",
        transaction_id: razorpay_payment_id,
        gateway_payment_id: razorpay_payment_id,
        gateway_response: JSON.stringify({
          orderId,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }),
        paid_at: trx.fn.now(),
        updated_at: trx.fn.now(),
      });

    await trx("orders")
      .where({ id: orderId })
      .update({
        status: "confirmed",
        updated_at: trx.fn.now(),
      });

    const updatedPayment = await trx("payments")
      .where({ order_id: orderId })
      .first();

    const updatedOrder = await trx("orders")
      .where({ id: orderId })
      .first();

    await trx.commit();

    try {
      const orderItems = await db("order_items").where({ order_id: orderId });

      if (updatedOrder?.shipping_email) {
        const mailResult = await sendOrderPlacedEmail({
          to: updatedOrder.shipping_email,
          customerName: updatedOrder.shipping_name,
          orderNumber: updatedOrder.order_number,
          orderDateText: new Date(updatedOrder.created_at).toLocaleString(),
          trackUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/orders/${updatedOrder.id}`,
          shipping: {
            name: updatedOrder.shipping_name,
            address1: updatedOrder.shipping_address_line1,
            address2: updatedOrder.shipping_address_line2,
            city: updatedOrder.shipping_city,
            state: updatedOrder.shipping_state,
            pincode: updatedOrder.shipping_postal_code,
            country: updatedOrder.shipping_country,
            phone: updatedOrder.shipping_phone,
          },
          items: orderItems.map((item) => ({
            name: item.product_name,
            sku: item.product_sku,
            qty: item.quantity,
            unitPrice: item.unit_price,
          })),
          totals: {
            subtotal: updatedOrder.subtotal_amount,
            gst: updatedOrder.total_gst_amount,
            total: updatedOrder.total_amount,
            currencySymbol: "₹",
          },
        });

        console.log("Order placed email sent:", mailResult.messageId);
      } else {
        console.log("Order placed email skipped: shipping_email not found");
      }
    } catch (mailError) {
      console.error("Order placed email failed:", mailError.message);
    }

    return {
      status: true,
      statusCode: 200,
      message: "Payment verified successfully",
      data: {
        order_id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        order_status: updatedOrder.status,
        payment_status: updatedPayment.status,
        transaction_id: updatedPayment.transaction_id,
      },
    };
  } catch (error) {
    await trx.rollback();
    return {
      status: false,
      statusCode: 400,
      message: error.message,
      data: null,
    };
  }
};