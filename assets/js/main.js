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

const basePrices = {

  "essential-bundle": {
    sedan:100,
    suv:115,
    large:130
  },

  "essential-interior": {
    sedan:75,
    suv:85,
    large:95
  },

  "essential-exterior": {
    sedan:55,
    suv:65,
    large:75
  },

  "tier2-bundle": {
    sedan:200,
    suv:220,
    large:240
  },

  "tier2-interior": {
    sedan:150,
    suv:165,
    large:180
  },

  "tier2-exterior": {
    sedan:95,
    suv:105,
    large:115
  },

  "tier3": {
    sedan:349,
    suv:379,
    large:409
  }

};

const conditionAdjust = {
  light:0,
  moderate:25,
  heavy:60
};

const addonPrices = {
  clay:50,
  headlights:150,
  engine:50,
  petHairLight:40,
  petHairHeavy:65
};

function formatMoney(n){
  return "$"+n;
}

function calcEstimate(){

  const size=document.getElementById("vehicleSize")?.value;
  const condition=document.getElementById("vehicleCondition")?.value;
  const pkg=document.getElementById("servicePackage")?.value;

  const range=document.getElementById("estimateRange");

  if(!size||!condition||!pkg){
    range.textContent="Select size, condition, and package to see estimate.";
    return;
  }

  let base=basePrices[pkg][size];

  base+=conditionAdjust[condition]||0;

  document.querySelectorAll(".addon:checked").forEach(cb=>{
    base+=addonPrices[cb.value]||0;
  });

  const low=Math.round(base*0.85);
  const high=Math.round(base*1.20);

  range.textContent=`${formatMoney(low)} – ${formatMoney(high)}`;

}

// Live updates

["vehicleSize","vehicleCondition","servicePackage"].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.addEventListener("change",calcEstimate);
});

document.querySelectorAll(".addon").forEach(cb=>{
  cb.addEventListener("change",calcEstimate);
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