/* =========================================================
   PIZZERIA FERRARI — Scripts
   Rendu de la carte depuis /data, interactions, accessibilité
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Utilitaires ---------- */
  function formatPrice(p) {
    if (Number.isInteger(p)) return p + " €";
    return p.toFixed(2).replace(".", ",") + " €";
  }
  function esc(str) {
    return String(str).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  /* ---------- Année footer ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header au défilement ---------- */
  const header = $(".site-header");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile (burger) ---------- */
  const burger = $("#burger");
  const nav = $("#main-nav");
  function closeNav() {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
  }
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    $$("a", nav).forEach(a => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- Reveal au défilement ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(el => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) { ent.target.classList.add("in"); io.unobserve(ent.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
  }

  /* ---------- Rendu des données ---------- */
  function renderFeatured(menu) {
    const grid = $("#featured-grid");
    if (!grid) return;
    const all = {};
    menu.categories.forEach(cat => cat.pizzas.forEach(p => { all[p.id] = p; }));
    const html = menu.featured.map(id => {
      const p = all[id];
      if (!p) return "";
      const img = p.img || "assets/img/p-" + id + ".webp";
      const tag = p.signature ? '<span class="pizza-card-tag">Signature</span>' : "";
      return `
        <article class="pizza-card reveal">
          <div class="pizza-card-media">
            ${tag}
            <img src="${esc(img)}" alt="Pizza ${esc(p.name)} — ${esc(p.ingredients)}" loading="lazy" width="640" height="480">
            <span class="pizza-card-price">${formatPrice(p.price)}</span>
          </div>
          <div class="pizza-card-body">
            <h3>${esc(p.name)}</h3>
            <p class="pizza-card-ing">${esc(p.ingredients)}</p>
            <div class="pizza-card-cta"><a href="tel:+33491428602" class="btn btn-red">📞 Commander</a></div>
          </div>
        </article>`;
    }).join("");
    grid.innerHTML = html;
  }

  function renderMenu(menu) {
    const tabsWrap = $("#menu-tabs");
    const panelsWrap = $("#menu-panels");
    if (!tabsWrap || !panelsWrap) return;

    tabsWrap.innerHTML = menu.categories.map((cat, i) => `
      <button class="menu-tab" role="tab" id="tab-${cat.id}" aria-controls="panel-${cat.id}"
              aria-selected="${i === 0 ? "true" : "false"}" data-cat="${cat.id}">
        <span aria-hidden="true">${cat.icon}</span> ${esc(cat.label)}
        <span class="tab-count">${esc(cat.count_note)}</span>
      </button>`).join("");

    panelsWrap.innerHTML = menu.categories.map((cat, i) => {
      const rows = cat.pizzas.map(p => {
        const note = p.note ? `<span class="pizza-row-note">${esc(p.note)}</span>` : "";
        return `
          <div class="pizza-row">
            <span class="pizza-row-main">
              <span class="pizza-row-name">${esc(p.name)}</span>${note}
              <span class="pizza-row-ing">${esc(p.ingredients)}</span>
            </span>
            <span class="pizza-row-dots" aria-hidden="true"></span>
            <span class="pizza-row-price">${formatPrice(p.price)}</span>
          </div>`;
      }).join("");
      return `
        <div class="menu-panel ${i === 0 ? "active" : ""}" id="panel-${cat.id}" role="tabpanel"
             aria-labelledby="tab-${cat.id}" ${i === 0 ? "" : "hidden"}>
          <div class="pizza-list">${rows}</div>
        </div>`;
    }).join("");

    const tabs = $$(".menu-tab", tabsWrap);
    tabs.forEach(tab => {
      tab.addEventListener("click", () => selectTab(tab.dataset.cat));
    });

    function selectTab(catId) {
      tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.cat === catId)));
      $$(".menu-panel", panelsWrap).forEach(pn => {
        const match = pn.id === "panel-" + catId;
        pn.classList.toggle("active", match);
        if (match) pn.removeAttribute("hidden"); else pn.setAttribute("hidden", "");
      });
    }
  }

  function renderSpecial(menu) {
    const el = $("#special-card");
    if (!el || !menu.special) return;
    const s = menu.special;
    el.innerHTML = `
      <span class="special-crown" aria-hidden="true">👑</span>
      <div class="special-info">
        <p class="special-kicker">La spéciale maison</p>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.ingredients)}</p>
      </div>
      <span class="special-price">${formatPrice(s.price)}</span>
      <a href="tel:+33491428602" class="btn btn-gold">📞 Commander</a>`;
  }

  function renderSecondary(menu) {
    const secRow = (name, detail, price) => `
      <div class="sec-row">
        <span class="sec-name">${esc(name)}${detail ? ` <span class="sec-detail">${esc(detail)}</span>` : ""}</span>
        <span class="sec-dots" aria-hidden="true"></span>
        <span class="sec-price">${formatPrice(price)}</span>
      </div>`;

    const desserts = $("#desserts-col");
    if (desserts) desserts.innerHTML = `<h3><span aria-hidden="true">🍫</span> Desserts</h3><p class="col-sub">Gourmandises</p>` +
      menu.desserts.map(d => secRow(d.name, d.ingredients, d.price)).join("");

    const drinks = $("#drinks-col");
    if (drinks) drinks.innerHTML = `<h3><span aria-hidden="true">🥤</span> Boissons</h3><p class="col-sub">Fraîcheur</p>` +
      menu.drinks.map(d => secRow(d.name, d.detail, d.price)).join("");

    const wines = $("#wines-col");
    if (wines) wines.innerHTML = `<h3><span aria-hidden="true">🍷</span> Vins</h3><p class="col-sub">75 cl</p>` +
      menu.wines.map(w => secRow(w.name, "", w.price)).join("");
  }

  function renderOffers(menu) {
    const grid = $("#offres-grid");
    if (!grid || !menu.offers) return;
    grid.innerHTML = menu.offers.map((o, i) => `
      <div class="offre-card reveal">
        <div class="offre-num">${i + 1}</div>
        <h3>${esc(o.title)}</h3>
        <p>${esc(o.detail)}</p>
      </div>`).join("");
  }

  /* ---------- Mentions légales (modale) ---------- */
  function initLegal(config) {
    const link = $("#mentions-link");
    if (!link) return;
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Mentions légales");
    modal.innerHTML = `
      <div class="modal-backdrop" data-close></div>
      <div class="modal-box">
        <button class="modal-close" data-close aria-label="Fermer">×</button>
        <h2>Mentions légales</h2>
        <h3>Éditeur</h3>
        <p>Pizzeria Ferrari<br>178 rue Ferrari, 13005 Marseille<br>Téléphone : 04 91 42 86 02</p>
        <h3>Hébergement</h3>
        <p>Ce site est hébergé par son prestataire d'hébergement web.</p>
        <h3>Données personnelles</h3>
        <p>Ce site vitrine ne collecte aucune donnée personnelle via un formulaire. Les appels passés via le bouton « Commander » sont établis directement avec la pizzeria.</p>
        <h3>Propriété intellectuelle</h3>
        <p>L'ensemble des éléments du site (textes, logos, visuels) est la propriété de la Pizzeria Ferrari ou utilisé avec autorisation. Toute reproduction est interdite sans accord préalable.</p>
      </div>`;
    document.body.appendChild(modal);
    const open = () => { modal.classList.add("open"); document.body.style.overflow = "hidden"; };
    const close = () => { modal.classList.remove("open"); document.body.style.overflow = ""; };
    link.addEventListener("click", e => { e.preventDefault(); open(); });
    modal.addEventListener("click", e => { if (e.target.hasAttribute("data-close")) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  /* ---------- Chargement ---------- */
  Promise.all([
    fetch("data/menu.json").then(r => r.json()),
    fetch("data/config.json").then(r => r.json()).catch(() => ({}))
  ]).then(([menu, config]) => {
    renderFeatured(menu);
    renderMenu(menu);
    renderSpecial(menu);
    renderSecondary(menu);
    renderOffers(menu);
    initLegal(config);
    // marque quelques blocs statiques comme révélables
    $$(".atout, .offre-card, .histoire-media, .avis-box").forEach(el => el.classList.add("reveal"));
    initReveal();
  }).catch(err => {
    console.error("Erreur de chargement des données :", err);
  });

})();
