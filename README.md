# Pizzeria Ferrari — Site vitrine V1

Site vitrine one-page (HTML / CSS / JS vanilla, 100% statique). Aucun backend, aucune dépendance externe au moment de l'exécution (polices auto-hébergées, images optimisées en WebP). Parcours client : découvrir → voir la carte → appeler pour commander.

## Structure

```
pizzeria-ferrari/
├── index.html          # Toutes les sections + données structurées SEO
├── css/
│   ├── style.css       # Design (palette, responsive, animations)
│   └── fonts.css       # @font-face Fraunces + Inter (auto-hébergées)
├── js/main.js          # Rendu de la carte depuis /data, interactions
├── data/
│   ├── menu.json       # ★ LA CARTE (pizzas, prix, ingrédients, offres, desserts, boissons, vins)
│   └── config.json     # ★ COORDONNÉES (adresse, tél, horaires, liens Google/Uber/Deliveroo)
├── assets/
│   ├── logo/           # Logos header/footer (WebP + PNG)
│   ├── icons/          # Favicons
│   ├── img/            # Hero, façade, photos pizzas vedettes (WebP)
│   └── fonts/          # Polices .woff2
├── robots.txt · sitemap.xml · site.webmanifest
```

## Modifier le contenu (sans toucher au code)

- **Prix / ingrédients / nom d'une pizza** → `data/menu.json`
- **Pizzas mises en avant (les 6 « incontournables »)** → tableau `featured` dans `menu.json` (liste d'identifiants `id`)
- **Photo d'une pizza** → champ `img` de la pizza dans `menu.json` (fichier dans `assets/img/`)
- **Offres, desserts, boissons, vins** → sections correspondantes de `menu.json`
- **Adresse, téléphone, horaires, liens** → `config.json`

Les prix sont des nombres (ex. `14` ou `1.5`), le site les formate automatiquement (`14 €`, `1,50 €`).

## À vérifier / compléter (voir aussi `_notes` dans config.json)

1. **Liens Uber Eats / Deliveroo** : actuellement des liens de **recherche provisoires**. À remplacer par les URL exactes de la fiche Ferrari sur chaque plateforme.
2. **Lien fiche Google** (`google_profile_url`) : à confirmer.
3. **Photos des pizzas vedettes** : ce sont les meilleures photos disponibles du dossier, associées au mieux. Facilement remplaçables via le champ `img`.
4. **Avis Google** : section « composant prêt » (aucun faux avis). À alimenter plus tard avec de vrais avis.
5. **Mentions légales** : hébergeur à préciser une fois l'hébergement choisi (texte dans `js/main.js`).

## Aperçu en local

Un petit serveur Node est fourni (`.claude/serve.js`). Sinon, n'importe quel serveur statique fait l'affaire. Ne pas ouvrir `index.html` en `file://` (le chargement de `menu.json` serait bloqué par le navigateur).

## Déploiement

### GitHub Pages (test)
Pousser le contenu du dossier `pizzeria-ferrari/` à la racine d'un dépôt, puis activer Pages. Le site marche tel quel.

### Hostinger (production)
Uploader le contenu de `pizzeria-ferrari/` à la racine (`public_html`). Penser à :
- remplacer l'URL `https://www.pizzaferrari.fr/` (déjà utilisée dans les balises canonical, Open Graph, sitemap) si le domaine final diffère ;
- vérifier que `sitemap.xml` et `robots.txt` sont bien accessibles à la racine ;
- soumettre le sitemap dans Google Search Console.

## Performance & SEO intégrés

Images WebP + lazy-load, hero préchargé et priorisé, polices auto-hébergées (woff2, `font-display:swap`), JS minimal sans librairie, HTML sémantique, données structurées `Restaurant` (Schema.org), Open Graph, favicon, sitemap, robots.txt. Le score Lighthouse réel reste à mesurer sur l'URL en ligne.
