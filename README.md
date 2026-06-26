# YMK SOL SàRL — site vitrine

Site vitrine mono-page pour **YMK SOL SàRL**, spécialiste des revêtements de sol
à Pully (canton de Vaud) : parquet, linoléum, PVC, moquette, ponçage et rénovation.

## Caractéristiques

- **HTML / CSS / JS pur** — aucune dépendance, aucun build, chargement quasi instantané.
- **Mobile-first** et entièrement responsive (barre d'action flottante sur mobile, nav complète sur desktop).
- **Sans formulaire de contact** : appel direct, e-mail et itinéraire en un tap.
- DA noir / or reprenant l'identité de la carte de visite, dans l'esprit de l'agence
  [We Are Brothers](https://wearebrothers.ch).
- SEO local : balises meta, Open Graph et données structurées `LocalBusiness`.
- Accessibilité : navigation clavier, `prefers-reduced-motion`, skip-link, contrastes.

## Structure

```
index.html              page unique
assets/css/style.css    styles (palette, responsive)
assets/js/main.js        menu mobile + animations au scroll
assets/img/logo.svg     logo vectoriel (rouleau de sol)
```

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```bash
python3 -m http.server 8080
```

## À compléter

- Photos de chantiers réels (galerie de réalisations).
- Coordonnées / horaires définitifs et nom de domaine final.
- Mentions légales si nécessaire.
