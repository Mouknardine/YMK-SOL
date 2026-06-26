# YMK SOL SàRL — site vitrine

Site vitrine mono-page, **orienté photo**, pour YMK SOL SàRL — spécialiste des
revêtements de sol à Pully (canton de Vaud) : parquet, linoléum, PVC, moquette,
ponçage et rénovation.

HTML / CSS / JS pur, aucune dépendance, aucun build → chargement quasi instantané.
DA noir / or dans l'esprit de l'agence [We Are Brothers](https://wearebrothers.ch).

## ⚠️ À FAIRE : déposer les photos

Dès que les fichiers sont déposés **au bon nom** dans `assets/img/`, ils s'affichent
automatiquement — zéro autre modification nécessaire. En attendant, des dégradés
de secours s'affichent.

| Fichier dans `assets/img/`  | Photo correspondante                              |
|-----------------------------|---------------------------------------------------|
| `salon-parquet.jpg`         | Salon moderne — parquet chêne clair (résidentiel) |
| `office-vide.jpg`           | Open-space vide — sol commercial gris             |
| `office-equipe.jpg`         | Bureau équipé de postes — moquette grise           |
| `moquette.jpg`              | Rouleau de moquette prêt à poser                  |
| `hero-pose.jpg`             | Parquet chêne posé sur encollage peigné (optionnel)|

> Format **JPG**, largeur ~1600–2000 px, compressé (< 400 Ko/image).

## Structure

```
index.html              page unique
assets/css/style.css    styles (placeholders, responsive, animations)
assets/js/main.js        menu, reveal, compteurs, lightbox galerie
assets/img/             logo + les 4 photos à ajouter
```

## Lancer en local

```bash
python3 -m http.server 8080   # puis http://localhost:8080
```

## Contenu / fonctionnalités

- Hero plein écran avec photo, titre animé, CTA Devis + E-mail
- Prestations (parquet, ponçage, moquette, PVC, linoléum, rénovation)
- Galerie de réalisations avec **lightbox** au clic
- Méthode en 4 étapes, compteurs animés, zone d'intervention
- Contact direct **sans formulaire** : appel, WhatsApp, e-mail (objet + corps
  pré-remplis), itinéraire — + dock d'action fixe sur mobile
- SEO local : meta, Open Graph, données structurées `LocalBusiness`
- Accessibilité : clavier, `prefers-reduced-motion`, skip-link

## À définir

- Nom de domaine final (placeholder `ymksol.ch` dans les balises SEO)
- Specs exactes de la DA wearebrothers.ch (police, couleurs) si à aligner au pixel
- Mentions légales éventuelles
