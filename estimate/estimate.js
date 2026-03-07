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

const estimateDocument = document.getElementById("estimateDocument");
const estimateOutput = document.getElementById("estimateOutput");
const copyEstimateBtn = document.getElementById("copyEstimate");
const printEstimateBtn = document.getElementById("printEstimate");

const taxRateInput = document.getElementById("taxRate");
const discountInput = document.getElementById("discount");
const vehicleSizeInput = document.getElementById("vehicleSize");
const vehicleConditionInput = document.getElementById("vehicleCondition");
const servicePackageInput = document.getElementById("servicePackage");
const estimateDateInput = document.getElementById("estimateDate");
const estimateNumberInput = document.getElementById("estimateNumber");

const summaryBase = document.getElementById("summaryBase");
const summaryAddons = document.getElementById("summaryAddons");
const summaryDiscount = document.getElementById("summaryDiscount");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTax = document.getElementById("summaryTax");
const summaryTotal = document.getElementById("summaryTotal");

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

function generateEstimateNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `EST-${year}${month}${day}-${random}`;
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

function buildEstimateText(data) {
  const addonLines = data.addons.length
    ? data.addons.map((item) => `• ${item}`).join("\n")
    : "• None";

  const notesText = data.notes ? data.notes : "None provided";

  const approvalLabelMap = {
    pending: "Pending",
    accepted: "Accepted",
    declined: "Declined"
  };

  return `Veteran Detail Services
Estimate ${data.estimateNumber || ""}
Date: ${data.estimateDate || ""}
Valid for: ${data.validDays} day(s)
Approval Status: ${approvalLabelMap[data.approvalStatus] || "Pending"}

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
Total Estimate: ${formatCurrency(data.total)}

Notes:
${notesText}

Estimate Approval

To approve this estimate and move forward with scheduling, reply:
ACCEPT

To decline this estimate, reply:
DECLINE

By accepting, customer authorizes Veteran Detail Services to perform the agreed service(s) at the estimated price shown above, subject to final confirmation of vehicle condition on arrival.

Thank you for considering Veteran Detail Services.`;
}

function buildEstimateDocumentHTML(data) {
  const addonLines = data.addons.length
    ? data.addons.map((item) => `<li>${item}</li>`).join("")
    : "<li>None</li>";

  const notesText = data.notes ? data.notes : "None provided";

  const approvalLabelMap = {
    pending: "Pending",
    accepted: "Accepted",
    declined: "Declined"
  };

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
        <h3>Estimate</h3>
        <p>${data.estimateNumber || ""}</p>
        <p>Date: ${data.estimateDate || ""}</p>
        <p>Status: ${approvalLabelMap[data.approvalStatus] || "Pending"}</p>
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
        <p>Valid for: ${data.validDays} day(s)</p>
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
      <div class="doc-total-row final"><span>Total Estimate</span><strong>${formatCurrency(data.total)}</strong></div>
    </div>

    <div class="doc-notes">
      <h4>Notes</h4>
      <p>${notesText}</p>
    </div>

    <div class="doc-approval">
      <h4>Estimate Approval</h4>
      <p>To approve this estimate and move forward with scheduling, reply <strong>ACCEPT</strong>.</p>
      <p>To decline this estimate, reply <strong>DECLINE</strong>.</p>
    </div>
  `;
}

function updateEstimate() {
  const base = getBaseServicePrice();
  const addonsTotal = getAddonTotal();
  const discount = parseFloat(discountInput.value) || 0;
  const taxRate = (parseFloat(taxRateInput.value) || 0) / 100;

  const preDiscount = base + addonsTotal;
  const subtotal = Math.max(preDiscount - discount, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  summaryBase.textContent = formatCurrency(base);
  summaryAddons.textContent = formatCurrency(addonsTotal);
  summaryDiscount.textContent = `-${formatCurrency(discount)}`;
  summarySubtotal.textContent = formatCurrency(subtotal);
  summaryTax.textContent = formatCurrency(tax);
  summaryTotal.textContent = formatCurrency(total);

  const vehicleSizeLabel = vehicleSizeInput.options[vehicleSizeInput.selectedIndex]?.text || "";
  const vehicleConditionLabel = vehicleConditionInput.options[vehicleConditionInput.selectedIndex]?.text || "";
  const packageLabel = packageLabels[servicePackageInput.value] || "";
  const addons = getSelectedAddonsText();

  const outputData = {
    estimateNumber: estimateNumberInput.value.trim(),
    estimateDate: formatDisplayDate(estimateDateInput.value),
    validDays: document.getElementById("validDays").value,
    approvalStatus: document.getElementById("approvalStatus").value,
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
    notes: document.getElementById("estimateNotes").value.trim()
  };

  estimateOutput.value = buildEstimateText(outputData);
  estimateDocument.innerHTML = buildEstimateDocumentHTML(outputData);
}

function initEstimateForm() {
  if (estimateDateInput && !estimateDateInput.value) {
    estimateDateInput.value = getTodayISO();
  }

  if (estimateNumberInput && !estimateNumberInput.value) {
    estimateNumberInput.value = generateEstimateNumber();
  }

  const watchedIds = [
    "customerName",
    "customerPhone",
    "customerEmail",
    "customerCity",
    "vehicle",
    "vehicleSize",
    "vehicleCondition",
    "estimateNumber",
    "servicePackage",
    "discount",
    "taxRate",
    "validDays",
    "estimateDate",
    "approvalStatus",
    "estimateNotes"
  ];

  watchedIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", updateEstimate);
    el.addEventListener("change", updateEstimate);
  });

  document.querySelectorAll(".addon").forEach((addon) => {
    addon.addEventListener("change", updateEstimate);
  });

  if (copyEstimateBtn) {
    copyEstimateBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(estimateOutput.value);
        const originalText = copyEstimateBtn.textContent;
        copyEstimateBtn.textContent = "Copied";
        setTimeout(() => {
          copyEstimateBtn.textContent = originalText;
        }, 1400);
      } catch (err) {
        alert("Could not copy estimate text. Please copy it manually.");
      }
    });
  }

  if (printEstimateBtn) {
    printEstimateBtn.addEventListener("click", () => window.print());
  }

  updateEstimate();
}

initEstimateForm();