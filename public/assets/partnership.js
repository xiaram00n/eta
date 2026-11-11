(function () {
  "use strict";

  class MoneyInputError extends Error {
    constructor(message, field) {
      super(message);
      this.name = "MoneyInputError";
      this.field = field;
    }
  }

  const MONEY_FIELDS = [
    ["fare", "Guest fare"],
    ["tripCosts", "Trip operating costs"],
    ["platformFee", "Platform fee"],
    ["coordinationPay", "Your coordination payment"],
    ["platformCosts", "Platform operating costs"]
  ];

  function parseMoney(value, label, field) {
    if (typeof value !== "string" || !value.trim()) {
      throw new MoneyInputError("Enter " + label.toLowerCase() + ". Use 0 if no amount is intended.", field);
    }
    const text = value.trim();
    if (!/^(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{0,2})?|\.\d{1,2})$/.test(text)) {
      throw new MoneyInputError(label + " must be a non-negative dollar amount with up to two decimal places.", field);
    }
    const [whole, fraction = ""] = text.replace(/,/g, "").split(".");
    const cents = Number(whole || "0") * 100 + Number(fraction.padEnd(2, "0"));
    if (!Number.isSafeInteger(cents) || cents > 100000000) {
      throw new MoneyInputError(label + " must not exceed $1,000,000 in this single-booking example.", field);
    }
    return cents;
  }

  function calculateExample(input) {
    if (!input || !["you", "another"].includes(input.fulfiller)) {
      throw new MoneyInputError("Choose who carries out the example trip.", "fulfiller");
    }
    const amounts = Object.fromEntries(MONEY_FIELDS.map(([field, label]) => [field, parseMoney(input[field], label, field)]));
    const { fare, tripCosts, platformFee, coordinationPay, platformCosts } = amounts;
    if (platformFee > fare) {
      throw new MoneyInputError("The fee is taken from the fare in this model, so it cannot exceed the fare.", "platformFee");
    }
    if (coordinationPay > platformFee) {
      throw new MoneyInputError("The coordination payment comes from the platform fee, so it cannot exceed that fee.", "coordinationPay");
    }
    const tripContribution = fare - tripCosts - platformFee;
    const yourDriving = input.fulfiller === "you" ? tripContribution : 0;
    return {
      ...amounts,
      fulfiller: input.fulfiller,
      tripContribution,
      withoutFee: fare - tripCosts,
      yourDriving,
      yourCoordination: coordinationPay,
      yourTotal: yourDriving + coordinationPay,
      otherDriving: input.fulfiller === "another" ? tripContribution : 0,
      platformRemaining: platformFee - coordinationPay - platformCosts
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { calculateExample, parseMoney, MoneyInputError };
  }
  if (typeof document === "undefined") return;

  const form = document.getElementById("earnings-form");
  const results = document.getElementById("money-results");
  const errorBox = document.getElementById("money-error");
  const status = document.getElementById("money-status");
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  let calculated = false;

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
    for (const control of form.querySelectorAll("[aria-invalid]")) {
      control.removeAttribute("aria-invalid");
      const describedBy = (control.getAttribute("aria-describedby") || "").split(" ").filter(id => id && id !== "money-error");
      if (describedBy.length) control.setAttribute("aria-describedby", describedBy.join(" "));
      else control.removeAttribute("aria-describedby");
    }
  }

  function amount(id, cents) {
    const element = document.getElementById(id);
    element.textContent = currency.format(cents / 100);
    element.dataset.negative = String(cents < 0);
    if (cents < 0) element.textContent += " (negative)";
  }

  function showResult(value) {
    amount("your-driving", value.yourDriving);
    amount("your-coordination", value.yourCoordination);
    amount("your-total", value.yourTotal);
    amount("other-driving", value.otherDriving);
    amount("fee-received", value.platformFee);
    amount("coordination-out", value.coordinationPay);
    amount("platform-costs-out", value.platformCosts);
    amount("platform-remaining", value.platformRemaining);
    document.getElementById("booking-role").textContent = value.fulfiller === "you"
      ? "You carry out this example trip. Your driving contribution and any separately agreed coordination payment are shown separately."
      : "Another operator carries out this example trip. You receive no driving income from their trip; only the coordination payment entered in the example.";
    document.getElementById("fee-comparison").textContent =
      "With the same fare and trip costs, the operator carrying out the trip would have " + currency.format(value.withoutFee / 100) +
      " before a platform fee, compared with " + currency.format(value.tripContribution / 100) +
      " after the " + currency.format(value.platformFee / 100) +
      " example fee. Any separate coordination payment is shown above, not included in this trip-only comparison.";
    results.hidden = false;
    calculated = true;
    status.textContent = "Example calculated from your figures. No commercial terms have been agreed, and no information has been sent.";
    document.getElementById("results-title").focus();
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    clearError();
    results.hidden = true;
    calculated = false;
    try {
      const input = Object.fromEntries(["fulfiller", ...MONEY_FIELDS.map(([field]) => field)].map(field => [field, form.elements.namedItem(field).value]));
      showResult(calculateExample(input));
    } catch (error) {
      status.textContent = "The example has not been calculated.";
      if (!(error instanceof MoneyInputError)) {
        console.error("Partnership example failed:", error);
        errorBox.textContent = "The example could not be calculated. Reload this page and try again. No information has been sent.";
        errorBox.hidden = false;
        return;
      }
      errorBox.textContent = error.message;
      errorBox.hidden = false;
      const control = form.elements.namedItem(error.field);
      control.setAttribute("aria-invalid", "true");
      control.setAttribute("aria-describedby", ((control.getAttribute("aria-describedby") || "") + " money-error").trim());
      control.focus();
    }
  });

  form.addEventListener("input", () => {
    clearError();
    if (!calculated) return;
    results.hidden = true;
    status.textContent = "Figures changed. Calculate again to see an updated example.";
  });
  form.addEventListener("change", () => {
    if (!calculated) return;
    results.hidden = true;
    status.textContent = "Example changed. Calculate again to see the updated split.";
  });
  form.addEventListener("reset", () => {
    clearError();
    results.hidden = true;
    calculated = false;
    status.textContent = "Figures cleared. No amounts are assumed or saved.";
  });

  const flowButtons = document.querySelectorAll("[data-flow]");
  for (const button of flowButtons) {
    button.addEventListener("click", () => {
      const selected = button.dataset.flow;
      for (const item of flowButtons) {
        item.setAttribute("aria-pressed", String(item.dataset.flow === selected));
        document.getElementById("flow-" + item.dataset.flow).hidden = item.dataset.flow !== selected;
      }
      document.getElementById("flow-status").textContent = selected === "ready"
        ? "Example: a suitable operator accepts. Four steps explain how the arrangement becomes a completed service."
        : "Example: no suitable operator is available. The ride stays unconfirmed; alternatives or a clear decline are needed.";
    });
  }
  document.querySelector(".flow-controls").hidden = false;
  document.getElementById("earnings-fields").disabled = false;
  form.removeAttribute("inert");
})();
