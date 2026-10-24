/* =========================================================
   PIZZERIA FERRARI — Générateur de site statique multi-page
   Assemble chaque page : <head> + header + contenu + footer.
   Source unique pour le header/footer/meta → zéro duplication à maintenir.
   Lancer :  node build/build.js
   ========================================================= */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.pizzaferrari.fr";

const NAV = [
  ["index.html", "Accueil", "accueil"],
  ["carte.html", "La carte", "carte"],
  ["offres.html", "Nos offres", "offres"],
  ["histoire.html", "Notre histoire", "histoire"],
  ["contact.html", "Contact", "contact"]
];

const PAGES = [
  {
    slug: "index.html", nav: "accueil", hero: true,
    title: "Pizzeria Ferrari | Pizza au feu de bois à Marseille 13005 depuis 1980",
    description: "Pizzeria Ferrari, institution marseillaise depuis 1980. 35 pizzas généreuses cuites au feu de bois, sur place, à emporter ou en livraison. 178 rue Ferrari, 13005 Marseille. Commandez au 04 91 42 86 02.",
    breadcrumb: null
  },
  {
    slug: "carte.html", nav: "carte", hero: false,
    title: "La carte | 35 pizzas au feu de bois - Pizzeria Ferrari Marseille",
    description: "Découvrez la carte de la Pizzeria Ferrari à Marseille : 22 pizzas base tomate, 13 pizzas à la crème fraîche, cuites au feu de bois, desserts, boissons et vins. Prix à partir de 10 €.",
    breadcrumb: "La carte"
  },
  {
    slug: "offres.html", nav: "offres", hero: false,
    title: "Nos offres & fidélité | Pizzeria Ferrari Marseille 5e",
    description: "Les offres de la Pizzeria Ferrari à Marseille : carte de fidélité, pizza ou boisson offerte, livraison offerte. Profitez-en au 04 91 42 86 02.",
    breadcrumb: "Nos offres"
  },
  {
    slug: "histoire.html", nav: "histoire", hero: false,
    title: "Notre histoire | Pizzeria au feu de bois depuis 1980 - Marseille",
    description: "Depuis 1980, la Pizzeria Ferrari fait vivre la tradition du feu de bois au 178 rue Ferrari, dans le 5e arrondissement de Marseille. Découvrez son histoire et son savoir-faire.",
    breadcrumb: "Notre histoire"
  },
  {
    slug: "contact.html", nav: "contact", hero: false,
    title: "Contact & accès | Pizzeria Ferrari - 178 rue Ferrari, 13005 Marseille",
    description: "Pizzeria Ferrari, 178 rue Ferrari, 13005 Marseille. Horaires tous les jours 18h-22h30, téléphone 04 91 42 86 02, itinéraire, livraison. Contactez-nous.",
    breadcrumb: "Contact"
  },
  {
    slug: "mentions-legales.html", nav: "", hero: false,
    title: "Mentions légales | Pizzeria Ferrari Marseille",
    description: "Mentions légales du site de la Pizzeria Ferrari, 178 rue Ferrari, 13005 Marseille.",
    breadcrumb: "Mentions légales", noindex: true
  }
];

/* ---------- Données structurées ---------- */
const restaurantJsonLd = () => JSON.stringify({
  "@context": "https://schema.org", "@type": "Restaurant",
  name: "Pizzeria Ferrari",
  description: "Pizzeria historique marseillaise depuis 1980, spécialisée dans les pizzas cuites au feu de bois.",
  image: SITE + "/assets/img/og-image.jpg", url: SITE + "/", telephone: "+33491428602",
  priceRange: "€", servesCuisine: ["Pizza", "Italienne"],
  address: { "@type": "PostalAddress", streetAddress: "178 rue Ferrari", postalCode: "13005", addressLocality: "Marseille", addressRegion: "Provence-Alpes-Côte d'Azur", addressCountry: "FR" },
  hasMap: "https://www.google.com/maps/dir/?api=1&destination=178+rue+Ferrari+13005+Marseille",
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "18:00", closes: "22:30" }],
  acceptsReservations: "False", areaServed: "Marseille"
});

const breadcrumbJsonLd = (page) => JSON.stringify({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Accueil", item: SITE + "/" },
    { "@type": "ListItem", position: 2, name: page.breadcrumb, item: SITE + "/" + page.slug }
  ]
});

/* ---------- Gabarits partagés ---------- */
function navHtml(active, footer = false) {
  return NAV.map(([href, label, key]) =>
    `<a href="${href}"${key === active ? ' aria-current="page" class="is-active"' : ""}>${label}</a>`
  ).join("\n      ");
}

function head(page) {
  const canonical = SITE + "/" + (page.slug === "index.html" ? "" : page.slug);
  const robots = page.noindex ? "noindex, follow" : "index, follow";
  const preloadHero = page.hero ? `
<link rel="preload" as="image" href="assets/img/hero-1600.webp" media="(min-width: 700px)">
<link rel="preload" as="image" href="assets/img/hero-mobile.webp" media="(max-width: 699px)">` : "";
  let jsonld = `<script type="application/ld+json">${restaurantJsonLd()}</script>`;
  if (page.breadcrumb && !page.noindex) jsonld += `\n<script type="application/ld+json">${breadcrumbJsonLd(page)}</script>`;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#111111">
<meta name="geo.region" content="FR-13">
<meta name="geo.placename" content="Marseille">
<meta property="og:type" content="restaurant">
<meta property="og:site_name" content="Pizzeria Ferrari">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:locale" content="fr_FR">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/assets/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="assets/icons/favicon-16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" href="assets/icons/favicon-180.png">
<link rel="manifest" href="site.webmanifest">${preloadHero}
<link rel="preload" as="font" type="font/woff2" href="assets/fonts/fraunces-900.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="assets/fonts/inter-400.woff2" crossorigin>
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/style.css">
${jsonld}
</head>
<body data-page="${page.nav}">
<a class="skip-link" href="#main">Aller au contenu</a>`;
}

function header(active) {
  return `
<header class="site-header" id="top">
  <div class="container header-inner">
    <a href="index.html" class="brand" aria-label="Pizzeria Ferrari, accueil">
      <picture>
        <source srcset="assets/logo/logo-header.webp" type="image/webp">
        <img src="assets/logo/logo-header.png" alt="Pizzeria Ferrari, depuis 1980" width="210" height="60" class="brand-logo">
      </picture>
    </a>
    <nav class="main-nav" id="main-nav" aria-label="Navigation principale">
      ${navHtml(active)}
    </nav>
    <div class="header-cta">
      <a href="tel:+33491428602" class="btn btn-red btn-order-header">
        <span class="btn-ico" aria-hidden="true">${ICON.phone}</span><span>Commander</span>
      </a>
    </div>
    <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="main-nav">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>`;
}

function footer(active) {
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <picture>
        <source srcset="assets/logo/logo-footer.webp" type="image/webp">
        <img src="assets/logo/logo-header.png" alt="Pizzeria Ferrari" width="200" height="57" loading="lazy">
      </picture>
      <p>La tradition du feu de bois depuis 1980.<br>Pizzeria familiale à Marseille 5e.</p>
      <div class="footer-social">
        <a href="https://g.page/r/CZF5BZ4UyT6UEBM/review" target="_blank" rel="noopener" class="btn btn-ghost-light btn-sm">Avis Google</a>
      </div>
    </div>
    <nav class="footer-nav" aria-label="Pied de page">
      <h3>Navigation</h3>
      ${navHtml(active, true)}
    </nav>
    <div class="footer-contact">
      <h3>Contact</h3>
      <p>178 rue Ferrari<br>13005 Marseille</p>
      <p><a href="tel:+33491428602">04 91 42 86 02</a></p>
      <p>Tous les jours<br>18h00 - 22h30</p>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <p>© <span id="year"></span> Pizzeria Ferrari — Tous droits réservés.</p>
      <p class="footer-legal"><a href="mentions-legales.html">Mentions légales</a></p>
    </div>
  </div>
</footer>
<a href="tel:+33491428602" class="mobile-cta" id="mobile-cta" aria-label="Appeler la Pizzeria Ferrari pour commander">
  <span class="mobile-cta-ico" aria-hidden="true">${ICON.phone}</span>
  <span class="mobile-cta-label">Commander</span>
</a>
<script src="js/main.js" defer></script>
</body>
</html>`;
}

/* ---------- Icônes SVG (jeu homogène) ---------- */
const ICON = {
  phone: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/></svg>'
};

/* ---------- Assemblage ---------- */
const contentDir = path.join(__dirname, "pages");
let built = [];
for (const page of PAGES) {
  const src = path.join(contentDir, page.slug.replace(/\.html$/, ".html"));
  if (!fs.existsSync(src)) { console.warn("Contenu manquant :", src); continue; }
  const content = fs.readFileSync(src, "utf8");
  const html = head(page) + header(page.nav) + '\n<main id="main">\n' + content + "\n</main>\n" + footer(page.nav);
  fs.writeFileSync(path.join(ROOT, page.slug), html, "utf8");
  built.push(page.slug);
}
console.log("Pages générées :", built.join(", "));
