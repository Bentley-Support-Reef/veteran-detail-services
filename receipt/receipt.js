const GOOGLE_REVIEW_URL = "https://g.page/r/Ce-Bddehsg52EAE/review";

const packagePrices = {
  "essential-exterior": { sedan: 55, suv: 65, large: 75 },
  "essential-interior": { sedan: 75, suv: 85, large: 95 },
  "essential-bundle": { sedan: 100, suv: 115, large: 130 },
  "tier2-exterior": { sedan: 95, suv: 105, large: 115 },
  "tier2-interior": { sedan: 150, suv: 165, large: 180 },
  "tier2-bundle": { sedan: 200, suv: 220, large: 240 },
  "tier3": { sedan: 349, suv: 379, large: 409 }
};

const conditionAdjustments = {
  light: 0,
  moderate: 25,
  heavy: 60
};

const addonPrices = {
  clay: 50,
  headlights: 150,
  engine: 50,
  petHairLight: 40,
  petHairHeavy: 65
};

const packageLabels = {
  "essential-exterior": "Essential Exterior Wash",
  "essential-interior": "Essential Interior Clean",
  "essential-bundle": "Essential Clean Package",
  "tier2-exterior": "Exterior Protection Detail",
  "tier2-interior": "Interior Restoration Detail",
  "tier2-bundle": "Complete Restoration Package",
  "tier3": "Signature Transformation Detail"
};

const addonLabels = {
  clay: "Paint Decontamination",
  headlights: "Headlight Restoration",
  engine: "Engine Bay Cleaning",
  petHairLight: "Pet Hair Removal – Light",
  petHairHeavy: "Pet Hair Removal – Heavy"
};

const vehicleSizeInput = document.getElementById("vehicleSize");
const vehicleConditionInput = document.getElementById("vehicleCondition");
const servicePackageInput = document.getElementById("servicePackage");
const receiptDateInput = document.getElementById("receiptDate");
const estimateReferenceInput = document.getElementById("estimateReference");
const invoiceReferenceInput = document.getElementById("invoiceReference");
const receiptNumberInput = document.getElementById("receiptNumber");
const discountInput = document.getElementById("discount");
const taxRateInput = document.getElementById("taxRate");
const amountPaidInput = document.getElementById("amountPaid");

const summaryBase = document.getElementById("summaryBase");
const summaryAddons = document.getElementById("summaryAddons");
const summaryDiscount = document.getElementById("summaryDiscount");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTax = document.getElementById("summaryTax");
const summaryTotal = document.getElementById("summaryTotal");

const receiptDocument = document.getElementById("receiptDocument");
const receiptOutput = document.getElementById("receiptOutput");
const copyReceiptBtn = document.getElementById("copyReceipt");
const printReceiptBtn = document.getElementById("printReceipt");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function formatDisplayDate(isoDate) {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function estimateToInvoice(estimateRef = "") {
  const trimmed = estimateRef.trim();
  if (trimmed.startsWith("EST-")) {
    return trimmed.replace(/^EST-/, "INV-");
  }
  return "";
}

function invoiceToEstimate(invoiceRef = "") {
  const trimmed = invoiceRef.trim();
  if (trimmed.startsWith("INV-")) {
    return trimmed.replace(/^INV-/, "EST-");
  }
  return "";
}

function generateReceiptNumber(estimateReference = "", invoiceReference = "") {
  const estimateTrimmed = estimateReference.trim();
  const invoiceTrimmed = invoiceReference.trim();

  if (invoiceTrimmed && invoiceTrimmed.startsWith("INV-")) {
    return invoiceTrimmed.replace(/^INV-/, "RCT-");
  }

  if (estimateTrimmed && estimateTrimmed.startsWith("EST-")) {
    return estimateTrimmed.replace(/^EST-/, "RCT-");
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `RCT-${year}${month}${day}-${random}`;
}

function syncEstimateAndInvoice(fromField) {
  const estimateVal = estimateReferenceInput.value.trim();
  const invoiceVal = invoiceReferenceInput.value.trim();

  if (fromField === "estimate") {
    if (estimateVal.startsWith("EST-")) {
      invoiceReferenceInput.value = estimateToInvoice(estimateVal);
    } else if (!estimateVal) {
      invoiceReferenceInput.value = "";
    }
  }

  if (fromField === "invoice") {
    if (invoiceVal.startsWith("INV-")) {
      estimateReferenceInput.value = invoiceToEstimate(invoiceVal);
    } else if (!invoiceVal) {
      estimateReferenceInput.value = "";
    }
  }

  receiptNumberInput.value = generateReceiptNumber(
    estimateReferenceInput.value,
    invoiceReferenceInput.value
  );
}

function getAddonTotal() {
  let total = 0;

  document.querySelectorAll(".addon:checked").forEach((addon) => {
    total += addonPrices[addon.value] || 0;
  });

  return total;
}

function getSelectedAddonsText() {
  const selected = [];

  document.querySelectorAll(".addon:checked").forEach((addon) => {
    const label = addonLabels[addon.value];
    if (label) selected.push(label);
  });

  return selected;
}

function getBaseServicePrice() {
  const pkg = servicePackageInput.value;
  const size = vehicleSizeInput.value;
  const condition = vehicleConditionInput.value;

  const packageBase = packagePrices[pkg]?.[size] || 0;
  const conditionAdd = conditionAdjustments[condition] || 0;

  return packageBase + conditionAdd;
}

function generateReviewQR() {
  const qrContainer = document.getElementById("reviewQR");
  const reviewLink = document.getElementById("reviewLink");

  if (!qrContainer || typeof QRCode === "undefined") return;

  qrContainer.innerHTML = "";

  new QRCode(qrContainer, {
    text: GOOGLE_REVIEW_URL,
    width: 140,
    height: 140,
    colorDark: "#0c2340",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  if (reviewLink) {
    reviewLink.textContent = GOOGLE_REVIEW_URL;
  }
}

function buildReceiptText(data) {
  const addonLines = data.addons.length
    ? data.addons.map((item) => `• ${item}`).join("\n")
    : "• None";

  const notesText = data.notes ? data.notes : "None provided";

  return `Veteran Detail Services
Receipt ${data.receiptNumber || ""}
Date: ${data.receiptDate || ""}
Estimate Ref: ${data.estimateReference || "N/A"}
Invoice Ref: ${data.invoiceReference || "N/A"}

Customer: ${data.customerName || ""}
Phone: ${data.customerPhone || ""}
Email: ${data.customerEmail || ""}
City: ${data.customerCity || ""}

Vehicle: ${data.vehicle || ""}
Vehicle Size: ${data.vehicleSizeLabel}
Condition: ${data.vehicleConditionLabel}

Service Completed:
• ${data.packageLabel}

Add-ons:
${addonLines}

Base Service: ${formatCurrency(data.base)}
Add-ons: ${formatCurrency(data.addonsTotal)}
Discount: -${formatCurrency(data.discount)}
Subtotal: ${formatCurrency(data.subtotal)}
Sales Tax: ${formatCurrency(data.tax)}
Total Paid: ${formatCurrency(data.totalPaid)}

Payment Method: ${data.paymentMethod}
Payment Status: ${data.paymentStatus}

Notes:
${notesText}

Thank you for choosing Veteran Detail Services.

⭐ If you were happy with your detail, a quick Google review helps our small veteran-owned business grow.

Leave a review here:
${GOOGLE_REVIEW_URL}

We truly appreciate your support!`;
}

function buildReceiptDocumentHTML(data) {
  const addonLines = data.addons.length
    ? data.addons.map((item) => `<li>${item}</li>`).join("")
    : "<li>None</li>";

  const notesText = data.notes ? data.notes : "None provided";

  return `
    <div class="doc-head">
      <div class="doc-brand">
        <img src="../assets/images/logo-header.png" alt="Veteran Detail Services logo">
        <div>
          <p class="doc-brand-title">Veteran Detail Services</p>
          <p class="doc-brand-sub">Mobile Detailing • Charlotte County, FL</p>
        </div>
      </div>

      <div class="doc-type">
        <h3>Receipt</h3>
        <p>${data.receiptNumber || ""}</p>
        <p>Date: ${data.receiptDate || ""}</p>
        <p>Invoice Ref: ${data.invoiceReference || "N/A"}</p>
      </div>
    </div>

    <div class="doc-grid">
      <div class="doc-block">
        <h4>Customer</h4>
        <p>${data.customerName || ""}</p>
        <p>${data.customerPhone || ""}</p>
        <p>${data.customerEmail || ""}</p>
        <p>${data.customerCity || ""}</p>
      </div>

      <div class="doc-block">
        <h4>Vehicle</h4>
        <p>${data.vehicle || ""}</p>
        <p>${data.vehicleSizeLabel}</p>
        <p>Condition: ${data.vehicleConditionLabel}</p>
        <p>Payment Method: ${data.paymentMethod}</p>
      </div>
    </div>

    <div class="doc-services">
      <h4>Service Completed</h4>
      <ul class="doc-list">
        <li>${data.packageLabel}</li>
      </ul>
    </div>

    <div class="doc-services">
      <h4>Add-ons</h4>
      <ul class="doc-list">
        ${addonLines}
      </ul>
    </div>

    <div class="doc-totals">
      <div class="doc-total-row"><span>Base Service</span><strong>${formatCurrency(data.base)}</strong></div>
      <div class="doc-total-row"><span>Add-ons</span><strong>${formatCurrency(data.addonsTotal)}</strong></div>
      <div class="doc-total-row"><span>Discount</span><strong>-${formatCurrency(data.discount)}</strong></div>
      <div class="doc-total-row"><span>Subtotal</span><strong>${formatCurrency(data.subtotal)}</strong></div>
      <div class="doc-total-row"><span>Sales Tax</span><strong>${formatCurrency(data.tax)}</strong></div>
      <div class="doc-total-row final"><span>Total Paid</span><strong>${formatCurrency(data.totalPaid)}</strong></div>
    </div>

    <div class="doc-notes">
      <h4>Notes</h4>
      <p>${notesText}</p>
    </div>
  `;
}

function updateReceipt() {
  const base = getBaseServicePrice();
  const addonsTotal = getAddonTotal();
  const discount = parseFloat(discountInput.value) || 0;
  const taxRate = (parseFloat(taxRateInput.value) || 0) / 100;
  const amountPaid = parseFloat(amountPaidInput.value) || 0;

  const preDiscount = base + addonsTotal;
  const subtotal = Math.max(preDiscount - discount, 0);
  const tax = subtotal * taxRate;
  const totalPaid = amountPaid > 0 ? amountPaid : subtotal + tax;

  summaryBase.textContent = formatCurrency(base);
  summaryAddons.textContent = formatCurrency(addonsTotal);
  summaryDiscount.textContent = `-${formatCurrency(discount)}`;
  summarySubtotal.textContent = formatCurrency(subtotal);
  summaryTax.textContent = formatCurrency(tax);
  summaryTotal.textContent = formatCurrency(totalPaid);

  const vehicleSizeLabel = vehicleSizeInput.options[vehicleSizeInput.selectedIndex]?.text || "";
  const vehicleConditionLabel = vehicleConditionInput.options[vehicleConditionInput.selectedIndex]?.text || "";
  const packageLabel = packageLabels[servicePackageInput.value] || "";
  const addons = getSelectedAddonsText();

  const outputData = {
    receiptNumber: receiptNumberInput.value.trim(),
    receiptDate: formatDisplayDate(receiptDateInput.value),
    estimateReference: estimateReferenceInput.value.trim(),
    invoiceReference: invoiceReferenceInput.value.trim(),
    customerName: document.getElementById("customerName").value.trim(),
    customerPhone: document.getElementById("customerPhone").value.trim(),
    customerEmail: document.getElementById("customerEmail").value.trim(),
    customerCity: document.getElementById("customerCity").value.trim(),
    vehicle: document.getElementById("vehicle").value.trim(),
    vehicleSizeLabel,
    vehicleConditionLabel,
    packageLabel,
    addons,
    base,
    addonsTotal,
    discount,
    subtotal,
    tax,
    totalPaid,
    paymentMethod: document.getElementById("paymentMethod").value,
    paymentStatus: document.getElementById("paymentStatus").value,
    notes: document.getElementById("receiptNotes").value.trim()
  };

  receiptOutput.value = buildReceiptText(outputData);
  receiptDocument.innerHTML = buildReceiptDocumentHTML(outputData);
}

function initReceiptForm() {
  if (receiptDateInput && !receiptDateInput.value) {
    receiptDateInput.value = getTodayISO();
  }

  if (receiptNumberInput && !receiptNumberInput.value) {
    receiptNumberInput.value = generateReceiptNumber(
      estimateReferenceInput ? estimateReferenceInput.value : "",
      invoiceReferenceInput ? invoiceReferenceInput.value : ""
    );
  }

  const watchedIds = [
    "customerName",
    "customerPhone",
    "customerEmail",
    "customerCity",
    "vehicle",
    "vehicleSize",
    "vehicleCondition",
    "servicePackage",
    "receiptDate",
    "discount",
    "taxRate",
    "amountPaid",
    "paymentMethod",
    "paymentStatus",
    "receiptNotes"
  ];

  watchedIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", updateReceipt);
    el.addEventListener("change", updateReceipt);
  });

  if (estimateReferenceInput) {
    estimateReferenceInput.addEventListener("input", () => {
      syncEstimateAndInvoice("estimate");
      updateReceipt();
    });
  }

  if (invoiceReferenceInput) {
    invoiceReferenceInput.addEventListener("input", () => {
      syncEstimateAndInvoice("invoice");
      updateReceipt();
    });
  }

  document.querySelectorAll(".addon").forEach((addon) => {
    addon.addEventListener("change", updateReceipt);
  });

  if (copyReceiptBtn) {
    copyReceiptBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(receiptOutput.value);
        const originalText = copyReceiptBtn.textContent;
        copyReceiptBtn.textContent = "Copied";
        setTimeout(() => {
          copyReceiptBtn.textContent = originalText;
        }, 1400);
      } catch (err) {
        alert("Could not copy receipt text. Please copy it manually.");
      }
    });
  }

  if (printReceiptBtn) {
    printReceiptBtn.addEventListener("click", () => window.print());
  }

  updateReceipt();
  generateReviewQR();
}

initReceiptForm();