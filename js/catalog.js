function iconSvg(name) {
  return CATEGORY_ICONS[name] || CATEGORY_ICONS.diamond;
}

function productCardHtml(p) {
  const badges = [];
  if (p.type === "egyedi") badges.push('<span class="tag">In My Style · Egyedi</span>');
  if (p.type === "import") badges.push('<span class="tag">Belga import</span>');
  if (p.badge) {
    const danger = /elfogy|kiárus/i.test(p.badge);
    badges.push(`<span class="tag ${danger ? "tag-danger" : "tag-dark"}">${p.badge}</span>`);
  }
  const specsHtml = p.specs
    ? '<div class="product-specs">' + Object.entries(p.specs).map(([k, v]) => `<span>${k}</span><span>${v}</span>`).join("") + '</div>'
    : "";
  const priceHtml = p.price
    ? `<div class="product-price">${p.price}</div>`
    : `<p style="color:var(--color-ink-soft); font-size:13px; margin:0 0 14px;">Hívj a részletekért, vagy írj üzenetet!</p>`;
  const ctaHtml = p.price
    ? `<a href="tel:+36203202996" class="btn btn-outline btn-block">Érdeklődöm</a>`
    : `<a href="tel:+36203202996" class="btn btn-dark btn-block">Hívás</a>`;
  return `
    <div class="product-card" data-type="${p.type || ""}">
      <div class="product-media"><img src="assets/photos/${p.photo}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;"></div>
      <div class="product-body">
        <div class="product-badges">${badges.join("")}</div>
        <h3>${p.name}</h3>
        ${specsHtml}
        ${priceHtml}
        ${ctaHtml}
      </div>
    </div>`;
}

function renderCategoryOverview(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const groups = [
    { key: "ruhazat", title: "Ruházat", eyebrow: "Ruházat", lead: "Kattints egy kategóriára a teljes válogatásért — mindegyikben találsz In My Style egyedi és belga import darabokat is." },
    { key: "kiegeszito", title: "Táskák, sálak és más apró luxus", eyebrow: "Kiegészítők", lead: "A ruhák mellett gondosan válogatott kiegészítőket is találsz — köztük saját márkás darabokat." }
  ];
  let html = "";
  groups.forEach((g) => {
    const items = CATEGORIES.filter((c) => c.group === g.key);
    html += `
      <div class="category-panel reveal">
        <div class="eyebrow">${g.eyebrow}</div>
        <h3 class="section-title" style="font-size:24px;">${g.title}</h3>
        <p class="section-lead" style="margin-bottom:22px; font-size:14px;">${g.lead}</p>
        <div class="category-grid">
          ${items.map((c) => `
            <a class="category-card" href="kategoria.html?slug=${c.slug}">
              <div class="cat-icon">${iconSvg(c.icon)}</div>
              <h4>${c.name}</h4>
              <div class="cat-tag">${c.tagline}</div>
              <span class="cat-link">Megnézem →</span>
            </a>`).join("")}
        </div>
      </div>`;
  });
  el.innerHTML = html;
}

function renderCategoryPage() {
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug") || "ing";
  const cat = CATEGORIES.find((c) => c.slug === slug) || CATEGORIES[0];
  const items = PRODUCTS.filter((p) => p.category === cat.slug);

  document.title = cat.name + " — In My Style";
  document.getElementById("cat-name").textContent = cat.name;
  document.getElementById("cat-name-title").textContent = cat.name;
  document.getElementById("cat-tagline").textContent = cat.tagline;
  document.getElementById("cat-lead").textContent =
    `Válogass ${cat.name.toLowerCase()} kínálatunkból — egyedi méretre készíthető In My Style darabok és fix méretű belga import kollekció között.`;

  const grid = document.getElementById("product-grid");
  if (items.length === 0) {
    grid.innerHTML = `<p style="color:var(--color-ink-soft); grid-column:1/-1;">Ebben a kategóriában hamarosan új darabok érkeznek — addig is hívj minket, és személyesen megmutatjuk, mi van készleten!</p>`;
  } else {
    grid.innerHTML = items.map(productCardHtml).join("");
  }
}

function renderSalePage() {
  const items = PRODUCTS.filter((p) => p.sale);
  const grid = document.getElementById("sale-grid");
  if (!grid) return;
  if (items.length === 0) {
    grid.innerHTML = `<p style="color:var(--color-ink-soft); grid-column:1/-1;">Jelenleg nincs aktív akció — nézz vissza hamarosan!</p>`;
  } else {
    grid.innerHTML = items.map(productCardHtml).join("");
  }
}
