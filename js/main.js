async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all(
    Array.from(nodes).map(async (node) => {
      const file = node.getAttribute("data-include");
      const res = await fetch(`partials/${file}`);
      node.innerHTML = await res.text();
    })
  );
  initNav();
}

function initNav() {
  const drawer = document.querySelector("[data-nav-drawer]");
  const backdrop = document.querySelector("[data-nav-backdrop]");
  const openBtn = document.querySelector("[data-nav-open]");
  const closeBtn = document.querySelector("[data-nav-close]");

  function open() {
    drawer.classList.add("open");
    backdrop.classList.add("open");
  }
  function close() {
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
  }
  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
}

function initFilterPills() {
  const pills = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const filter = pill.getAttribute("data-filter");
      cards.forEach((card) => {
        const match = filter === "all" || card.getAttribute("data-category") === filter;
        card.style.display = match ? "" : "none";
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  includePartials();
  initFilterPills();
});
