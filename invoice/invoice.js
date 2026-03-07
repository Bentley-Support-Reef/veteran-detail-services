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

const taxRateInput = document.getElementById("taxRate");
const discountInput = document.getElementById("discount");
const amountPaidInput = document.getElementById("amountPaid");
const vehicleSizeInput = document.getElementById("vehicleSize");
const vehicleConditionInput = document.getElementById("vehicleCondition");
const servicePackageInput = document.getElementById("servicePackage");
const invoiceDateInput = document.getElementById("invoiceDate");
const invoiceNumberInput = document.getElementById("invoiceNumber");
const estimateReferenceInput = document.getElementById("estimateReference");

const summaryBase = document.getElementById("summaryBase");
const summaryAddons = document.getElementById("summaryAddons");
const summaryDiscount = document.getElementById("summaryDiscount");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTax = document.getElementById("summaryTax");
const summaryTotal = document.getElementById("summaryTotal");
const summaryPaid = document.getElementById("summaryPaid");
const summaryBalance = document.getElementById("summaryBalance");
const balanceDueDisplay = document.getElementById("balanceDueDisplay");

const invoiceDocument = document.getElementById("invoiceDocument");
const invoiceOutput = document.getElementById("invoiceOutput");
const copyInvoiceBtn = document.getElementById("copyInvoice");
const printInvoiceBtn = document.getElementById("printInvoice");

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

function generateInvoiceNumber(estimateReference = "") {
  const trimmed = estimateReference.trim();

  if (trimmed && trimmed.startsWith("EST-")) {
    return trimmed.replace(/^EST-/, "INV-");
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `INV-${year}${month}${day}-${random}`;
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

function buildInvoiceText(data) {
  const addonLines = data.addons.length
    ? data.addons.map((item) => `• ${item}`).join("\n")
    : "• None";

  const notesText = data.notes ? data.notes : "None provided";

  return `Veteran Detail Services
Invoice ${data.invoiceNumber || ""}
Date: ${data.invoiceDate || ""}
Estimate Ref: ${data.estimateReference || "N/A"}

Customer: ${data.customerName || ""}
Phone: ${data.customerPhone || ""}
Email: ${data.customerEmail || ""}
City: ${data.customerCity || ""}

Vehicle: ${data.vehicle || ""}
Vehicle Size: ${data.vehicleSizeLabel}
Condition: ${data.vehicleConditionLabel}

Service:
• ${data.packageLabel}

Add-ons:
${addonLines}

Base Service: ${formatCurrency(data.base)}
Add-ons: ${formatCurrency(data.addonsTotal)}
Discount: -${formatCurrency(data.discount)}
Subtotal: ${formatCurrency(data.subtotal)}
Sales Tax: ${formatCurrency(data.tax)}
Total Invoice: ${formatCurrency(data.total)}

Payment Method: ${data.paymentMethod}
Payment Status: ${data.paymentStatus}
Amount Paid: ${formatCurrency(data.amountPaid)}
Balance Due: ${formatCurrency(data.balanceDue)}

Notes:
${notesText}

Thank you for choosing Veteran Detail Services.`;
}

function buildInvoiceDocumentHTML(data) {
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
        <h3>Invoice</h3>
        <p>${data.invoiceNumber || ""}</p>
        <p>Date: ${data.invoiceDate || ""}</p>
        <p>Estimate Ref: ${data.estimateReference || "N/A"}</p>
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
        <p>Payment Status: ${data.paymentStatus}</p>
      </div>
    </div>

    <div class="doc-services">
      <h4>Service</h4>
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
      <div class="doc-total-row final"><span>Total Invoice</span><strong>${formatCurrency(data.total)}</strong></div>
      <div class="doc-total-row"><span>Amount Paid</span><strong>${formatCurrency(data.amountPaid)}</strong></div>
      <div class="doc-total-row"><span>Balance Due</span><strong>${formatCurrency(data.balanceDue)}</strong></div>
    </div>

    <div class="doc-notes">
      <h4>Notes</h4>
      <p>${notesText}</p>
    </div>
  `;
}

function updateInvoice() {
  const base = getBaseServicePrice();
  const addonsTotal = getAddonTotal();
  const discount = parseFloat(discountInput.value) || 0;
  const taxRate = (parseFloat(taxRateInput.value) || 0) / 100;
  const amountPaid = parseFloat(amountPaidInput.value) || 0;

  const preDiscount = base + addonsTotal;
  const subtotal = Math.max(preDiscount - discount, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const balanceDue = Math.max(total - amountPaid, 0);

  summaryBase.textContent = formatCurrency(base);
  summaryAddons.textContent = formatCurrency(addonsTotal);
  summaryDiscount.textContent = `-${formatCurrency(discount)}`;
  summarySubtotal.textContent = formatCurrency(subtotal);
  summaryTax.textContent = formatCurrency(tax);
  summaryTotal.textContent = formatCurrency(total);
  summaryPaid.textContent = formatCurrency(amountPaid);
  summaryBalance.textContent = formatCurrency(balanceDue);
  balanceDueDisplay.value = formatCurrency(balanceDue);

  const vehicleSizeLabel = vehicleSizeInput.options[vehicleSizeInput.selectedIndex]?.text || "";
  const vehicleConditionLabel = vehicleConditionInput.options[vehicleConditionInput.selectedIndex]?.text || "";
  const packageLabel = packageLabels[servicePackageInput.value] || "";
  const addons = getSelectedAddonsText();

  const outputData = {
    invoiceNumber: invoiceNumberInput.value.trim(),
    invoiceDate: formatDisplayDate(invoiceDateInput.value),
    estimateReference: estimateReferenceInput.value.trim(),
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
    total,
    paymentMethod: document.getElementById("paymentMethod").value,
    paymentStatus: document.getElementById("paymentStatus").value,
    amountPaid,
    balanceDue,
    notes: document.getElementById("invoiceNotes").value.trim()
  };

  invoiceOutput.value = buildInvoiceText(outputData);
  invoiceDocument.innerHTML = buildInvoiceDocumentHTML(outputData);
}

function initInvoiceForm() {
  if (invoiceDateInput && !invoiceDateInput.value) {
    invoiceDateInput.value = getTodayISO();
  }

  if (invoiceNumberInput && !invoiceNumberInput.value) {
    invoiceNumberInput.value = generateInvoiceNumber(
      estimateReferenceInput ? estimateReferenceInput.value : ""
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
    "estimateReference",
    "invoiceDate",
    "paymentMethod",
    "paymentStatus",
    "servicePackage",
    "discount",
    "taxRate",
    "amountPaid",
    "invoiceNotes"
  ];

  watchedIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", updateInvoice);
    el.addEventListener("change", updateInvoice);
  });

  if (estimateReferenceInput && invoiceNumberInput) {
    estimateReferenceInput.addEventListener("input", () => {
      invoiceNumberInput.value = generateInvoiceNumber(estimateReferenceInput.value);
      updateInvoice();
    });
  }

  document.querySelectorAll(".addon").forEach((addon) => {
    addon.addEventListener("change", updateInvoice);
  });

  if (copyInvoiceBtn) {
    copyInvoiceBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(invoiceOutput.value);
        const originalText = copyInvoiceBtn.textContent;
        copyInvoiceBtn.textContent = "Copied";
        setTimeout(() => {
          copyInvoiceBtn.textContent = originalText;
        }, 1400);
      } catch (err) {
        alert("Could not copy invoice text. Please copy it manually.");
      }
    });
  }

  if (printInvoiceBtn) {
    printInvoiceBtn.addEventListener("click", () => window.print());
  }

  updateInvoice();
}

initInvoiceForm();