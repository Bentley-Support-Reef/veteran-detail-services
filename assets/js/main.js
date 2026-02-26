// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Smooth scroll + close mobile nav
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;

    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth" });

    if (nav?.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    }
  });
});

// FAQ accordion
const questions = document.querySelectorAll(".faq-q");
questions.forEach((btn) => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    const answer = btn.nextElementSibling;

    questions.forEach((b) => {
      if (b !== btn) {
        b.setAttribute("aria-expanded", "false");
        const a = b.nextElementSibling;
        if (a) a.hidden = true;
        const icon = b.querySelector(".faq-icon");
        if (icon) icon.textContent = "+";
      }
    });

    btn.setAttribute("aria-expanded", String(!expanded));
    if (answer) answer.hidden = expanded;

    const icon = btn.querySelector(".faq-icon");
    if (icon) icon.textContent = expanded ? "+" : "–";
  });
});

// ---------------------------
// Instant estimate calculator
// ---------------------------

// Base package starting ranges by size (low, high)
const packagePricing = {
  maintenance: {
    sedan: [169, 209],
    suv: [189, 229],
    large: [209, 249],
  },
  interior: {
    sedan: [229, 289],
    suv: [269, 339],
    large: [309, 389],
  },
  full: {
    sedan: [329, 399],
    suv: [379, 459],
    large: [429, 529],
  },
};

// Condition modifiers (adds to low/high)
const conditionAdd = {
  light: [0, 0],
  moderate: [20, 50],
  heavy: [50, 120],
};

// Add-ons ranges
const addonRanges = {
  engine: [40, 60],
  headlights: [100, 140],
  odor: [50, 95],
  decon: [50, 90],
  petHair: [30, 80],
};

function formatMoney(n) {
  return `$${n.toString()}`;
}

function calcEstimate() {
  const size = document.getElementById("vehicleSize")?.value;
  const condition = document.getElementById("vehicleCondition")?.value;
  const pkg = document.getElementById("servicePackage")?.value;

  const rangeEl = document.getElementById("estimateRange");
  if (!rangeEl) return;

  if (!size || !condition || !pkg) {
    rangeEl.textContent = "Select size, condition, and package to see a range.";
    return;
  }

  let [low, high] = packagePricing[pkg][size];

  const [cLow, cHigh] = conditionAdd[condition];
  low += cLow;
  high += cHigh;

  // add-ons
  document.querySelectorAll(".addon:checked").forEach((cb) => {
    const key = cb.value;
    if (!addonRanges[key]) return;
    low += addonRanges[key][0];
    high += addonRanges[key][1];
  });

  rangeEl.textContent = `${formatMoney(low)} – ${formatMoney(high)}`;
}

// Wire up live updates
["vehicleSize", "vehicleCondition", "servicePackage"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", calcEstimate);
});

document.querySelectorAll(".addon").forEach((cb) => {
  cb.addEventListener("change", calcEstimate);
});

// Quote form submit (Formspree)
const form = document.getElementById("quoteForm");
const statusEl = document.getElementById("formStatus");

function setStatus(type, msg) {
  if (!statusEl) return;
  statusEl.className = `form-status ${type}`;
  statusEl.textContent = msg;
  statusEl.style.display = "block";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Make sure estimate is up to date before sending
    calcEstimate();

    // Clear previous status
    if (statusEl) {
      statusEl.className = "form-status";
      statusEl.textContent = "";
      statusEl.style.display = "none";
    }

    const endpoint = form.getAttribute("action");
    if (!endpoint) {
      setStatus("error", "Form endpoint missing. Please try again later or call (941) 236-1478.");
      return;
    }

    const formData = new FormData(form);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" },
      });

      if (res.ok) {
        setStatus("success", "Thanks! Your request was sent. We’ll reach out shortly.");
        form.reset();
        calcEstimate();
        return;
      }

      let data = null;
      try { data = await res.json(); } catch (_) {}

      const msg =
        data?.errors?.map((err) => err.message).join(", ") ||
        "Something went wrong sending your request. Please call or try again.";

      setStatus("error", msg);
    } catch (err) {
      setStatus("error", "Network error. Please try again or call (941) 236-1478.");
    }
  });
}

// run once on load
calcEstimate();