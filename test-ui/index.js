const payBtn = document.getElementById("payBtn");
const apiBaseUrlInput = document.getElementById("apiBaseUrl");
const authTokenInput = document.getElementById("authToken");
const statusBox = document.getElementById("statusBox");
const logBox = document.getElementById("logBox");

function setStatus(type, message) {
  statusBox.className = `status ${type}`;
  statusBox.textContent = message;
}

function appendLog(title, data) {
  const oldText = logBox.textContent === "No logs yet." ? "" : `${logBox.textContent}\n\n`;
  const nextText = `${oldText}--- ${title} ---\n${
    typeof data === "string" ? data : JSON.stringify(data, null, 2)
  }`;
  logBox.textContent = nextText;
}

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = authTokenInput.value.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getCheckoutPayload() {
  return {
    shipping_name: document.getElementById("shipping_name").value.trim(),
    shipping_email: document.getElementById("shipping_email").value.trim(),
    shipping_phone: document.getElementById("shipping_phone").value.trim(),
    shipping_address_line1: document.getElementById("shipping_address_line1").value.trim(),
    shipping_address_line2: document.getElementById("shipping_address_line2").value.trim(),
    shipping_city: document.getElementById("shipping_city").value.trim(),
    shipping_state: document.getElementById("shipping_state").value.trim(),
    shipping_postal_code: document.getElementById("shipping_postal_code").value.trim(),
    shipping_country: document.getElementById("shipping_country").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };
}

async function createOrder() {
  const apiBaseUrl = apiBaseUrlInput.value.trim().replace(/\/+$/, "");
  const url = `${apiBaseUrl}/orders/checkout`;
  const payload = getCheckoutPayload();

  appendLog("Checkout Request", { url, payload });

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  appendLog("Checkout Response", data);

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Checkout failed");
  }

  return data.data;
}

async function verifyPayment({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  const apiBaseUrl = apiBaseUrlInput.value.trim().replace(/\/+$/, "");
  const url = `${apiBaseUrl}/payments/verify`;

  const payload = {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  };

  appendLog("Verify Request", { url, payload });

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  appendLog("Verify Response", data);

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Payment verification failed");
  }

  return data;
}

function openRazorpay(checkoutData) {
  return new Promise((resolve, reject) => {
    const amountInPaise = Math.round(Number(checkoutData.amount) * 100);

    const options = {
      key: checkoutData.key,
      amount: amountInPaise,
      currency: checkoutData.currency || "INR",
      order_id: checkoutData.razorpayOrderId,
      name: "RV Jewellery",
      description: `Order ${checkoutData.orderNumber}`,
      prefill: {
        name: checkoutData.customer?.name || "",
        email: checkoutData.customer?.email || "",
        contact: checkoutData.customer?.contact || "",
      },
      notes: {
        local_order_id: String(checkoutData.orderId),
        local_order_number: checkoutData.orderNumber,
      },
      theme: {
        color: "#c9a14a",
      },
      handler(response) {
        appendLog("Razorpay Success Callback", response);
        resolve(response);
      },
      modal: {
        ondismiss() {
          reject(new Error("Payment popup closed by user"));
        },
      },
    };

    appendLog("Razorpay Options", {
      ...options,
      handler: "[Function]",
      modal: { ondismiss: "[Function]" },
    });

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      appendLog("Razorpay Failed Callback", response.error || response);
      reject(new Error(response.error?.description || "Payment failed"));
    });

    rzp.open();
  });
}

async function handleCheckoutAndPay() {
  try {
    payBtn.disabled = true;
    logBox.textContent = "No logs yet.";
    setStatus("loading", "Creating order...");

    const checkoutData = await createOrder();

    setStatus("loading", "Opening Razorpay...");
    appendLog("Checkout Data Used For Razorpay", checkoutData);

    const razorpayResponse = await openRazorpay(checkoutData);

    setStatus("loading", "Verifying payment with backend...");

    const verifyResult = await verifyPayment({
      orderId: checkoutData.orderId,
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
    });

    setStatus("success", "Payment verified successfully. Order confirmed.");
    appendLog("Final Success", verifyResult);
  } catch (error) {
    console.error(error);
    setStatus("error", error.message || "Something went wrong");
    appendLog("Error", { message: error.message });
  } finally {
    payBtn.disabled = false;
  }
}

payBtn.addEventListener("click", handleCheckoutAndPay);