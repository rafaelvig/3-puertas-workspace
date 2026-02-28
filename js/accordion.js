document.addEventListener("click", function (e) {
  const header = e.target.closest(".accordion-header");
  if (!header) return;

  const item = header.parentElement;

  document.querySelectorAll(".accordion-item").forEach(el => {
    if (el !== item) el.classList.remove("active");
  });

  item.classList.toggle("active");
});
