document.addEventListener("click", function (e) {
  const header = e.target.closest(".accordion-header");
  if (!header) return;

  const item = header.parentElement;

  document.querySelectorAll(".accordion-item").forEach(el => {
    if (el !== item) el.classList.remove("active");
  });

  item.classList.toggle("active");
});
export function initAccordions() {
  document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
      const item = header.parentElement;
      document.querySelectorAll(".accordion-item").forEach(el => {
        if (el !== item) el.classList.remove("active");
      });
      item.classList.toggle("active");
    });
  });
}
