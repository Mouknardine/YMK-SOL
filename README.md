# YMK SOL SàRL — site vitrine

Site vitrine **multi-pages** pour YMK SOL SàRL, spécialiste des revêtements de
sol à Pully (canton de Vaud) : parquet, linoléum, PVC, moquette, ponçage et
rénovation.

HTML / CSS / JS pur, aucune dépendance de build → chargement quasi instantané.
Identité graphique affirmée : base **gris minéral**, **noir** franc (filets
épais, gros chiffres), accent **ambre** repris du logo, typographie Cabinet
Grotesk + Satoshi. **Fond animé** léger (halos qui dérivent), aucune animation
au scroll. Site par [We Are Brothers](https://wearebrothers.ch).

## Pages (4)

| Fichier              | Contenu                                                  |
|----------------------|----------------------------------------------------------|
| `index.html`         | Accueil : hero, aperçu prestations et réalisations       |
| `realisations.html`  | Réalisations en grandes lignes alternées (lightbox)      |
| `prestations.html`   | Prestations en tuiles + méthode en 4 étapes              |
| `contact.html`       | Téléphone, WhatsApp, e-mail, atelier                     |

## Images (`assets/img/`)

| Fichier               | Photo                                             |
|-----------------------|---------------------------------------------------|
| `salon-parquet.jpg`   | Salon, parquet géométrique, vue lac (hero)        |
| `office-equipe.jpg`   | Boutique de prestige, moquette rouge              |
| `office-vide.jpg`     | Chantier commercial, dalles moquette              |
| `moquette.jpg`        | Chambre, moquette sisal                           |

## Régénérer les pages

Les pages partagent le même header/footer. Elles sont générées depuis un
template commun (`build.py`, hors dépôt) pour garantir la cohérence. Le HTML
généré est ce qui est servi ; aucun build n'est requis pour publier.

## Lancer en local

```bash
python3 -m http.server 8080   # puis http://localhost:8080
```
