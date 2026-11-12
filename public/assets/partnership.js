(function () {
  "use strict";

  if (typeof document === "undefined") return;

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
})();
