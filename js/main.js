/* =========================================================
   PIZZERIA FERRARI — Scripts (direction éditoriale)
   Chaque rendu ne s'exécute que si son conteneur existe.
   ========================================================= */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  function price(p) {
    return (Number.isInteger(p) ? p : p.toFixed(2).replace(".", ",")) + " €";
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  function stars(n) { n = Math.round(n || 0); return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n); }

  /* ---- Icônes SVG ---- */
  const ICONS = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/>',
    route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H14a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h3.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function injectIcons(root = document) {
    $$("[data-ico]", root).forEach(el => {
      const k = el.getAttribute("data-ico");
      if (!ICONS[k] || el.dataset.done) return;
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
      el.dataset.done = "1";
    });
  }

  /* ---- Année ---- */
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ---- Header scrollé ---- */
  const header = $(".site-header");
  if (header) {
    const f = () => header.classList.toggle("scrolled", window.scrollY > 40);
    f(); window.addEventListener("scroll", f, { passive: true });
  }

  /* ---- Menu mobile ---- */
  const burger = $("#burger"), nav = $("#main-nav");
  if (burger && nav) {
    const close = () => { nav.classList.remove("open"); document.body.classList.remove("nav-open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Ouvrir le menu"); };
    burger.addEventListener("click", () => {
      const o = nav.classList.toggle("open");
      document.body.classList.toggle("nav-open", o);
      burger.setAttribute("aria-expanded", String(o));
      burger.setAttribute("aria-label", o ? "Fermer le menu" : "Ouvrir le menu");
    });
    $$("a", nav).forEach(a => a.addEventListener("click", close));
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  /* ---- Reveal robuste ---- */
  function initReveal() {
    const els = $$(".reveal"); if (!els.length) return;
    const show = el => el.classList.add("in");
    const sweep = () => els.forEach(el => { if (!el.classList.contains("in")) { const r = el.getBoundingClientRect(); if (r.top < (window.innerHeight || 0) * 0.96 && r.bottom > 0) show(el); } });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
      els.forEach(el => io.observe(el));
    } else { els.forEach(show); return; }
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) sweep(); });
    requestAnimationFrame(sweep); setTimeout(sweep, 700);
  }

  /* ---- Ouvert / Fermé (heure de Marseille, Europe/Paris) ---- */
  function marseilleMinutes() {
    try {
      const p = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      return (+p.find(x => x.type === "hour").value) * 60 + (+p.find(x => x.type === "minute").value);
    } catch (e) { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  }
  function openClosed() {
    const els = $$(".js-oc"); if (!els.length) return;
    function paint() {
      const open = (() => { const m = marseilleMinutes(); return m >= 1080 && m <= 1350; })();
      els.forEach(el => {
        el.hidden = false;
        el.classList.remove("is-open", "is-closed");
        el.classList.add(open ? "is-open" : "is-closed");
        el.innerHTML = open
          ? '<span class="oc-dot"></span><strong>Ouvert</strong><span class="oc-note">jusqu\'à 22h30</span>'
          : '<span class="oc-dot"></span><strong>Fermé</strong><span class="oc-note">ouvre à 18h</span>';
      });
    }
    paint();
    setInterval(paint, 60000);
  }

  /* ---- Sous-menu « La carte » (accordéon mobile ; survol/focus géré en CSS) ---- */
  function initSubmenu() {
    $$(".sub-toggle").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        const item = btn.closest(".has-sub");
        const open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---- FAQ accordéon ---- */
  function initFaq() {
    $$(".faq-item").forEach(item => {
      const btn = $(".faq-q", item);
      if (!btn) return;
      btn.addEventListener("click", () => {
        const open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---- Réseaux sociaux (placeholders tant que les comptes ne sont pas fournis) ---- */
  function renderSocial(cfg) {
    const el = $("#footer-social"); if (!el) return;
    const s = (cfg && cfg.social) || {};
    const chip = (url, label) => url
      ? `<a href="${esc(url)}" target="_blank" rel="noopener" class="social-chip">${label}</a>`
      : `<span class="social-chip is-soon" aria-disabled="true" title="Bientôt disponible">${label}<small>bientôt</small></span>`;
    el.innerHTML = `<p class="social-label">Suivez-nous</p><div class="social-row">${chip(s.instagram, "Instagram")}${chip(s.tiktok, "TikTok")}</div>`;
  }

  /* ---- Rail vedettes ---- */
  function renderRail(menu) {
    const rails = $$(".js-rail"); if (!rails.length) return;
    const all = {}; menu.categories.forEach(c => c.pizzas.forEach(p => all[p.id] = p));
    rails.forEach(rail => {
      const lim = parseInt(rail.dataset.featured || "0", 10);
      let ids = menu.featured.slice(); if (lim > 0) ids = ids.slice(0, lim);
      rail.innerHTML = ids.map(id => {
        const p = all[id]; if (!p) return "";
        const img = p.img || "assets/img/p-" + id + ".webp";
        const tag = p.signature ? '<span class="rail-tag">La signature</span>' : "";
        return `<article class="rail-card">
          <div class="rail-card-media"><img src="${esc(img)}" alt="Pizza ${esc(p.name)} au feu de bois" loading="lazy" width="440" height="550"></div>
          ${tag}
          <div class="rail-meta"><span class="rail-name">${esc(p.name)}</span><span class="rail-price">${price(p.price)}</span></div>
        </article>`;
      }).join("");
    });
  }

  /* ---- Carte ---- */
  function renderMenu(menu) {
    const tg = $("#menu-toggles"), pn = $("#menu-panels"); if (!tg || !pn) return;
    tg.innerHTML = menu.categories.map((c, i) =>
      `<button class="menu-toggle" role="tab" id="t-${c.id}" aria-controls="p-${c.id}" aria-selected="${i === 0}" data-cat="${c.id}">${esc(c.label)}<span class="count">${esc(c.count_note)}</span></button>`
    ).join("");
    pn.innerHTML = menu.categories.map((c, i) => {
      const rows = c.pizzas.map(p => `
        <div class="m-row">
          <span class="m-name">${esc(p.name)}${p.note ? `<span class="m-note">${esc(p.note)}</span>` : ""}</span>
          <span class="m-price">${price(p.price)}</span>
          <span class="m-ing">${esc(p.ingredients)}</span>
        </div>`).join("");
      return `<div class="menu-panel ${i === 0 ? "active" : ""}" id="p-${c.id}" role="tabpanel" aria-labelledby="t-${c.id}" ${i === 0 ? "" : "hidden"}><div class="menu-grid">${rows}</div></div>`;
    }).join("");
    const tabs = $$(".menu-toggle", tg);
    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(x => x.setAttribute("aria-selected", String(x.dataset.cat === t.dataset.cat)));
      $$(".menu-panel", pn).forEach(p => { const ok = p.id === "p-" + t.dataset.cat; p.classList.toggle("active", ok); ok ? p.removeAttribute("hidden") : p.setAttribute("hidden", ""); });
    }));
  }

  function renderSpecial(menu) {
    const el = $("#special"); if (!el || !menu.special) return;
    const s = menu.special;
    el.innerHTML = `<div style="flex:1;min-width:220px"><p class="m-special-k">La spéciale maison</p><h3>${esc(s.name)}</h3><p>${esc(s.ingredients)}</p></div><span class="m-special-price">${price(s.price)}</span>`;
  }

  function renderSides(menu) {
    const row = (n, d, p) => `<div class="side-row"><span class="side-name">${esc(n)}${d ? ` <span class="side-detail">${esc(d)}</span>` : ""}</span><span class="side-price">${price(p)}</span></div>`;
    const d = $("#desserts"); if (d) d.innerHTML = `<h3>Desserts</h3><p class="side-sub">Gourmandises</p>` + menu.desserts.map(x => row(x.name, x.ingredients, x.price)).join("");
    const b = $("#boissons"); if (b) b.innerHTML = `<h3>Boissons</h3><p class="side-sub">Fraîcheur</p>` + menu.drinks.map(x => row(x.name, x.detail, x.price)).join("");
    const w = $("#vins"); if (w) w.innerHTML = `<h3>Vins</h3><p class="side-sub">75 cl</p>` + menu.wines.map(x => row(x.name, "", x.price)).join("");
  }

  /* ---- Offres (campagne) ---- */
  function renderPromo(menu) {
    const el = $("#promo-js"); if (!el || !menu.offers || !menu.offers.length) return;
    const lead = menu.offers[0], rest = menu.offers.slice(1);
    el.innerHTML = `
      <div class="promo-lead reveal">
        <p class="promo-kicker">Avantages maison</p>
        <p class="promo-big">${esc(lead.title)}</p>
        <p class="promo-sub">${esc(lead.detail)}</p>
        <a href="tel:+33491428602" class="btn btn--primary"><span class="ico" data-ico="phone"></span> J'en profite</a>
      </div>
      <ul class="promo-list reveal">
        ${rest.map(o => `<li class="promo-item"><p class="promo-item-title">${esc(o.title)}</p><p class="promo-item-text">${esc(o.detail)}</p></li>`).join("")}
        <li class="promo-item"><p class="promo-item-text promo-small" style="margin:0">Offres valables selon les conditions en vigueur à la pizzeria.</p></li>
      </ul>`;
    injectIcons(el);
  }

  /* ---- Avis Google (réels) ---- */
  function renderReviews(cfg) {
    const el = $("#reviews-js"); if (!el) return;
    const r = (cfg && cfg.rating) || {}, list = (cfg && cfg.reviews) || [];
    const profile = (cfg && cfg.google_profile_url) || (cfg && cfg.google_review_url) || "#";
    const review = (cfg && cfg.google_review_url) || "#";
    let head = `<div class="reviews-head">
      <div class="rev-score">
        ${r.value ? `<span class="rev-score-num">${esc(r.value)}</span>` : ""}
        <div class="rev-score-meta">
          <div class="rev-stars" aria-hidden="true">${r.value ? stars(parseFloat(String(r.value).replace(",", "."))) : "★★★★★"}</div>
          <div class="rev-count">${r.count ? esc(r.count) + " avis " : ""}${esc(r.source || "Google")}</div>
        </div>
      </div>
      <a href="${esc(profile)}" class="btn btn--line btn--sm" target="_blank" rel="noopener">Voir tous les avis</a>
    </div>`;
    let body;
    if (list.length) {
      body = `<div class="reviews-grid">` + list.map(rv => `
        <figure class="rev-card reveal">
          <div class="rev-stars" aria-hidden="true">${stars(rv.rating)}</div>
          <blockquote class="rev-quote">${esc(rv.text)}</blockquote>
          <figcaption><span class="rev-author">${esc(rv.author)}</span>${rv.date ? ` <span class="rev-meta">· ${esc(rv.date)}</span>` : ""}</figcaption>
        </figure>`).join("") + `</div>`;
    } else {
      body = `<div class="reviews-empty">
        <p>Nos clients nous notent sur Google. Une sélection sera bientôt mise en avant ici — en attendant, allez y jeter un œil.</p>
        <a href="${esc(review)}" class="btn btn--primary" target="_blank" rel="noopener">Laisser un avis</a>
      </div>`;
    }
    el.innerHTML = head + body;
  }

  /* ---- Livraison ---- */
  function renderDelivery(cfg) {
    const el = $("#delivery-links"); if (!el || !cfg || !cfg.delivery) return;
    const d = cfg.delivery; let h = "";
    if (d.uber_eats_url) h += `<a href="${esc(d.uber_eats_url)}" class="btn btn--line btn--sm" target="_blank" rel="noopener">Uber Eats</a>`;
    if (d.deliveroo_url) h += `<a href="${esc(d.deliveroo_url)}" class="btn btn--line btn--sm" target="_blank" rel="noopener">Deliveroo</a>`;
    el.innerHTML = h;
  }

  /* ---- Carte Google au clic ---- */
  function mapLazy() {
    const b = $("#map-load-btn"), box = $("#map-lazy"); if (!b || !box) return;
    b.addEventListener("click", () => {
      box.outerHTML = `<iframe title="Localisation de la Pizzeria Ferrari" src="${box.dataset.src}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    });
  }

  /* ---- FAB : masqué dès qu'une zone d'appel est visible ---- */
  function fab() {
    const f = $("#mobile-cta"); if (!f || !("IntersectionObserver" in window)) return;
    const zones = $$(".site-footer, .contact, .cta-band, .page-head, .hero"); if (!zones.length) return;
    const vis = new Set();
    const io = new IntersectionObserver(es => { es.forEach(e => { e.isIntersecting ? vis.add(e.target) : vis.delete(e.target); }); f.classList.toggle("is-hidden", vis.size > 0); }, { rootMargin: "0px 0px -8% 0px" });
    zones.forEach(z => io.observe(z));
  }

  injectIcons(document);
  openClosed();
  initSubmenu();
  initFaq();
  fab();

  Promise.all([
    fetch("data/menu.json").then(r => r.json()),
    fetch("data/config.json").then(r => r.json()).catch(() => ({}))
  ]).then(([menu, cfg]) => {
    renderRail(menu); renderMenu(menu); renderSpecial(menu); renderSides(menu);
    renderPromo(menu); renderReviews(cfg); renderDelivery(cfg); renderSocial(cfg); mapLazy();
    $$(".rail-card, .story-media, .promo-item, .faq-item").forEach(el => el.classList.add("reveal"));
    initReveal();
  }).catch(err => { console.error("Données :", err); renderSocial({}); mapLazy(); initReveal(); });
})();
