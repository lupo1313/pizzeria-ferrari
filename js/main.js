/* =========================================================
   PIZZERIA FERRARI — Scripts (multi-page)
   Les fonctions de rendu sont tolérantes : chacune ne s'exécute
   que si son conteneur existe sur la page courante.
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function formatPrice(p) {
    if (Number.isInteger(p)) return p + " €";
    return p.toFixed(2).replace(".", ",") + " €";
  }
  function esc(str) {
    return String(str).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  /* ---------- Jeu d'icônes SVG ---------- */
  const ICONS = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/>',
    flame: '<path d="M12 2s5 4.5 5 9.5a5 5 0 0 1-10 0c0-1.7.8-3 1.6-4C8.4 9 9 8 9 8s.5 2 2 2c0-3 1-6 1-8Z"/>',
    pizza: '<path d="M12 2a19 19 0 0 1 10 5L12 22 2 7A19 19 0 0 1 12 2Z"/><circle cx="12" cy="8.5" r="1.1" fill="#111" stroke="none"/><circle cx="9" cy="12" r="1.1" fill="#111" stroke="none"/><circle cx="14.5" cy="12.5" r="1.1" fill="#111" stroke="none"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H14a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h3.5"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 10-4 14-9 14-2 0-4-1-5-3"/><path d="M11 20c0-5 2-9 7-11"/>',
    scooter: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 18h7M18 16V9h-3M4 9h6l3 7"/>'
  };
  function injectIcons(root = document) {
    $$("[data-ico]", root).forEach(el => {
      const key = el.getAttribute("data-ico");
      if (!ICONS[key] || el.dataset.done) return;
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key]}</svg>`;
      el.dataset.done = "1";
    });
  }

  /* ---------- Année ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header au défilement ---------- */
  const header = $(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  const burger = $("#burger");
  const nav = $("#main-nav");
  if (burger && nav) {
    const closeNav = () => {
      nav.classList.remove("open");
      document.body.classList.remove("nav-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Ouvrir le menu");
    };
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      document.body.classList.toggle("nav-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    $$("a", nav).forEach(a => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });
  }

  /* ---------- FAB mobile : masqué dès qu'une zone d'appel est visible (anti-doublon) ---------- */
  (function () {
    const fab = $("#mobile-cta");
    if (!fab || !("IntersectionObserver" in window)) return;
    const zones = $$(".site-footer, .contact, .contact-cta, .page-hero, .hero");
    if (!zones.length) return;
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
      fab.classList.toggle("is-hidden", visible.size > 0);
    }, { rootMargin: "0px 0px -8% 0px" });
    zones.forEach(z => io.observe(z));
  })();

  /* ---------- Reveal ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!els.length) return;
    const show = el => el.classList.add("in");
    // Balayage : révèle tout élément entré dans la fenêtre. Garantit qu'aucun
    // contenu ne reste masqué, même si l'IntersectionObserver ne se déclenche pas.
    const sweep = () => {
      let remaining = false;
      els.forEach(el => {
        if (el.classList.contains("in")) return;
        const r = el.getBoundingClientRect();
        if (r.top < (window.innerHeight || document.documentElement.clientHeight) * 0.96 && r.bottom > 0) show(el);
        else remaining = true;
      });
      return remaining;
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(ent => { if (ent.isIntersecting) { show(ent.target); io.unobserve(ent.target); } });
      }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
      els.forEach(el => io.observe(el));
    } else {
      els.forEach(show);
      return;
    }
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) sweep(); });
    requestAnimationFrame(sweep);
    setTimeout(sweep, 700);
  }

  /* ---------- Ouvert / Fermé ---------- */
  function renderOpenClosed() {
    const el = $("#openclosed");
    if (!el) return;
    // Ouvert tous les jours 18h00 - 22h30 (heure locale du visiteur)
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = mins >= 18 * 60 && mins <= 22 * 60 + 30;
    el.hidden = false;
    el.classList.add(open ? "is-open" : "is-closed");
    el.innerHTML = open
      ? '<span class="oc-dot"></span><strong>Ouvert maintenant</strong><span class="oc-note">jusqu\'à 22h30</span>'
      : '<span class="oc-dot"></span><strong>Fermé</strong><span class="oc-note">ouverture tous les jours à 18h00</span>';
  }

  /* ---------- Rendus carte ---------- */
  function renderFeatured(menu) {
    const grids = $$(".js-featured");
    if (!grids.length) return;
    const all = {};
    menu.categories.forEach(cat => cat.pizzas.forEach(p => { all[p.id] = p; }));
    grids.forEach(grid => {
      const limit = parseInt(grid.dataset.featured || "0", 10);
      let ids = menu.featured.slice();
      if (limit > 0) ids = ids.slice(0, limit);
      grid.innerHTML = ids.map(id => {
        const p = all[id]; if (!p) return "";
        const img = p.img || "assets/img/p-" + id + ".webp";
        const tag = p.signature ? '<span class="pizza-card-tag">Signature</span>' : "";
        return `
        <article class="pizza-card reveal">
          <div class="pizza-card-media">${tag}
            <img src="${esc(img)}" alt="Pizza ${esc(p.name)} — ${esc(p.ingredients)}" loading="lazy" width="640" height="480">
            <span class="pizza-card-price">${formatPrice(p.price)}</span>
          </div>
          <div class="pizza-card-body">
            <h3>${esc(p.name)}</h3>
            <p class="pizza-card-ing">${esc(p.ingredients)}</p>
            <div class="pizza-card-cta"><a href="tel:+33491428602" class="btn btn-red btn-sm"><span class="ico" data-ico="phone"></span> Commander</a></div>
          </div>
        </article>`;
      }).join("");
      injectIcons(grid);
    });
  }

  function renderMenu(menu) {
    const tabsWrap = $("#menu-tabs"), panelsWrap = $("#menu-panels");
    if (!tabsWrap || !panelsWrap) return;
    tabsWrap.innerHTML = menu.categories.map((cat, i) => `
      <button class="menu-tab" role="tab" id="tab-${cat.id}" aria-controls="panel-${cat.id}"
              aria-selected="${i === 0 ? "true" : "false"}" data-cat="${cat.id}">
        ${esc(cat.label)} <span class="tab-count">${esc(cat.count_note)}</span>
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
      return `<div class="menu-panel ${i === 0 ? "active" : ""}" id="panel-${cat.id}" role="tabpanel" aria-labelledby="tab-${cat.id}" ${i === 0 ? "" : "hidden"}><div class="pizza-list">${rows}</div></div>`;
    }).join("");
    const tabs = $$(".menu-tab", tabsWrap);
    tabs.forEach(tab => tab.addEventListener("click", () => {
      tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.cat === tab.dataset.cat)));
      $$(".menu-panel", panelsWrap).forEach(pn => {
        const match = pn.id === "panel-" + tab.dataset.cat;
        pn.classList.toggle("active", match);
        if (match) pn.removeAttribute("hidden"); else pn.setAttribute("hidden", "");
      });
    }));
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
      <a href="tel:+33491428602" class="btn btn-gold"><span class="ico" data-ico="phone"></span> Commander</a>`;
    injectIcons(el);
  }

  function renderSecondary(menu) {
    const block = (name, below, price) => `
      <div class="sec-row">
        <span class="sec-main"><span class="sec-name">${esc(name)}</span>${below ? `<span class="sec-detail">${esc(below)}</span>` : ""}</span>
        <span class="sec-dots" aria-hidden="true"></span>
        <span class="sec-price">${formatPrice(price)}</span>
      </div>`;
    const desserts = $("#desserts-col");
    if (desserts) desserts.innerHTML = `<h3>Desserts</h3><p class="col-sub">Gourmandises</p>` +
      menu.desserts.map(d => block(d.name, d.ingredients, d.price)).join("");
    const drinks = $("#drinks-col");
    if (drinks) drinks.innerHTML = `<h3>Boissons</h3><p class="col-sub">Fraîcheur</p>` +
      menu.drinks.map(d => block(d.name, d.detail, d.price)).join("");
    const wines = $("#wines-col");
    if (wines) wines.innerHTML = `<h3>Vins</h3><p class="col-sub">75 cl</p>` +
      menu.wines.map(w => block(w.name, "", w.price)).join("");
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

  /* ---------- Avis ---------- */
  function renderAvis(config) {
    const el = $("#avis-content");
    if (!el) return;
    const reviews = (config && config.reviews) || [];
    const rating = (config && config.rating) || {};
    let head = "";
    if (rating.value) {
      head = `<div class="avis-rating"><span class="avis-rating-num">${esc(rating.value)}</span>
        <span class="avis-stars" aria-hidden="true">★★★★★</span>
        ${rating.count ? `<span class="avis-rating-count">${esc(rating.count)} avis Google</span>` : ""}</div>`;
    }
    if (reviews.length) {
      const cards = reviews.map(r => `
        <figure class="avis-card reveal">
          <div class="avis-stars" aria-hidden="true">★★★★★</div>
          <blockquote>${esc(r.text)}</blockquote>
          <figcaption>— ${esc(r.author)}</figcaption>
        </figure>`).join("");
      el.innerHTML = head + `<div class="avis-grid">${cards}</div>
        <div class="section-cta"><a href="https://g.page/r/CZF5BZ4UyT6UEBM/review" class="btn btn-gold" target="_blank" rel="noopener">Laisser un avis</a></div>`;
    } else {
      el.innerHTML = `
        <div class="avis-box">
          <div class="avis-stars" aria-hidden="true">★★★★★</div>
          <p class="avis-lead">Vous êtes déjà venu chez Ferrari ?</p>
          <p class="avis-text">Votre avis nous fait grandir et aide d'autres Marseillais à nous découvrir. Vos retours seront bientôt affichés ici.</p>
          <div class="avis-actions">
            <a href="https://g.page/r/CZF5BZ4UyT6UEBM/review" class="btn btn-gold" target="_blank" rel="noopener">Laisser un avis Google</a>
            <a href="https://share.google/ZJxFsEv9wNh0HJPlC" class="btn btn-dark" target="_blank" rel="noopener">Voir la fiche Google</a>
          </div>
        </div>`;
    }
    injectIcons(el);
  }

  /* ---------- Livraison ---------- */
  function renderDelivery(config) {
    const el = $("#delivery-links");
    if (!el || !config || !config.delivery) return;
    const d = config.delivery;
    let html = "";
    if (d.uber_eats_url) html += `<a href="${esc(d.uber_eats_url)}" class="btn btn-dark" target="_blank" rel="noopener">Uber Eats</a>`;
    if (d.deliveroo_url) html += `<a href="${esc(d.deliveroo_url)}" class="btn btn-dark" target="_blank" rel="noopener">Deliveroo</a>`;
    el.innerHTML = html;
  }

  /* ---------- Carte Google au clic (RGPD) ---------- */
  function initMapLazy() {
    const btn = $("#map-load-btn"), box = $("#map-lazy");
    if (!btn || !box) return;
    btn.addEventListener("click", () => {
      const src = box.dataset.src;
      box.outerHTML = `<iframe title="Localisation de la Pizzeria Ferrari" src="${src}" width="100%" height="100%" style="border:0;min-height:360px;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    });
  }

  /* ---------- Init icônes statiques (header/footer) ---------- */
  injectIcons(document);
  renderOpenClosed();

  /* ---------- Chargement des données ---------- */
  Promise.all([
    fetch("data/menu.json").then(r => r.json()),
    fetch("data/config.json").then(r => r.json()).catch(() => ({}))
  ]).then(([menu, config]) => {
    renderFeatured(menu);
    renderMenu(menu);
    renderSpecial(menu);
    renderSecondary(menu);
    renderOffers(menu);
    renderAvis(config);
    renderDelivery(config);
    initMapLazy();
    $$(".atout, .offre-card, .histoire-media, .avis-box, .page-hero").forEach(el => el.classList.add("reveal"));
    initReveal();
  }).catch(err => {
    console.error("Erreur de chargement des données :", err);
    initMapLazy();
    initReveal();
  });

})();
