# Pizzeria Ferrari — Site vitrine (multi-page)

Site vitrine **multi-page** statique (HTML / CSS / JS vanilla), généré depuis une source unique. Aucun backend, aucune dépendance externe à l'exécution (polices auto-hébergées, images WebP). Objectif : découvrir → voir la carte → appeler pour commander.

## Pages

| Fichier | Page |
|---|---|
| `index.html` | Accueil (hero, atouts, vedettes, aperçus, avis, contact) |
| `carte.html` | La carte (35 pizzas, burger, desserts, boissons, vins) |
| `offres.html` | Nos offres & fidélité |
| `histoire.html` | Notre histoire (depuis 1980) |
| `contact.html` | Contact & accès (horaires, ouvert/fermé, carte, livraison) |
| `mentions-legales.html` | Mentions légales |

Chaque page a son `title` / `meta description` / `canonical` / H1 / Open Graph propres + données structurées (Restaurant + fil d'Ariane).

## ⚙️ Comment modifier le site

### Les prix, pizzas, offres (le plus fréquent) — SANS régénérer
Tout est dans `data/` et chargé dynamiquement :
- **Carte** (pizzas, prix, ingrédients, vedettes, desserts, boissons, vins, offres) → `data/menu.json`
- **Coordonnées, horaires, liens, avis** → `data/config.json`

Pas besoin de relancer le build : il suffit d'éditer le JSON.

### Le texte des pages, le header/footer, les métas — AVEC régénération
Le header, le pied de page et les balises `<head>` sont définis **une seule fois** dans `build/build.js`. Le contenu propre à chaque page est dans `build/pages/`.
Après modification, régénérer les pages :

```bash
node build/build.js
```

Cela réécrit les 6 fichiers `.html` à la racine. (Node.js requis.)

### Les avis Google
Dans `data/config.json`, remplir `rating` (`value`, `count`) et le tableau `reviews` (`{ "author": "...", "text": "..." }`). Le bloc avis s'actualise automatiquement (sinon il affiche l'invitation à laisser un avis).

## À compléter (voir `_notes` dans config.json)
1. Vrais liens Uber Eats / Deliveroo (actuellement liens de recherche).
2. Confirmer le lien de la fiche Google.
3. Ajouter de vrais avis dans `config.json`.
4. Coordonnées de l'hébergeur dans les mentions légales (`build/pages/mentions-legales.html` puis rebuild).

## Aperçu en local
Serveur Node fourni : `.claude/serve.js` (depuis la racine du projet parent). Ne pas ouvrir en `file://` (le chargement des JSON serait bloqué).

## Déploiement
- **GitHub Pages** (en ligne) : repo `lupo1313/pizzeria-ferrari` → https://lupo1313.github.io/pizzeria-ferrari/
- **Hostinger** : uploader le contenu de `pizzeria-ferrari/` dans `public_html`, remplacer l'URL `https://www.pizzaferrari.fr/` si le domaine final diffère, soumettre `sitemap.xml` dans Search Console.

## Perf & SEO
Multi-page (une entrée Google par intention), HTML sémantique, images WebP + lazy-load, hero préchargé, 5 graisses de police auto-hébergées (woff2, swap), JS maison sans librairie, carte Google chargée au clic (RGPD), JSON-LD, sitemap, robots, favicon. Score Lighthouse réel à mesurer sur l'URL en ligne.
