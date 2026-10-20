# Maquette de page d'accueil DecoParis

Maquette statique de la page d'accueil de [decoparis.net](https://decoparis.net), réalisée par Collet Marketing pour démontrer qu'avec la même esthétique la page peut être rapide sur mobile, parfaitement lisible par Google et par les IA (ChatGPT, Gemini, Perplexity).

## Contenu du dépôt

| Fichier | Rôle |
| --- | --- |
| `index.html` | La page complète : CSS critique inline, JSON-LD, 12 sections, menu mobile (15 lignes de JavaScript inline). |
| `images/` | Visuels en AVIF, WebP et JPEG, en plusieurs largeurs (480, 800, 960, 1600 px). |
| `images/src/` | À créer : déposez-y les photos originales du site (voir ci-dessous). |
| `fonts/poppins-*.woff2` | Police Poppins auto-hébergée (graisses 400 et 600, sous-ensemble latin). |
| `tools/build-images.mjs` | Pipeline qui produit les AVIF / WebP / JPEG à partir des originaux. |
| `docs/captures/` | Captures d'écran en 375, 768 et 1440 px. |
| `.github/workflows/pages.yml` | Déploiement automatique sur GitHub Pages à chaque push sur `main`. |

## Remplacer les visuels de substitution par les photos du site

L'environnement de création n'avait pas accès à decoparis.net. Le logo et les trois dessins de profils des gammes ont été extraits d'une capture d'écran du site (`images/src/`) ; les autres visuels (hero, chantiers, image Open Graph) sont des dégradés brun / taupe générés automatiquement, avec un libellé indiquant la photo attendue. Pour les remplacer :

1. Téléchargez les photos du site (hero, 3 gammes, 3 chantiers, image Open Graph) et renommez-les ainsi dans `images/src/` : `hero-facade.jpg`, `hero-facade-mobile.jpg` (recadrage vertical), `gamme-modenature.jpg`, `gamme-coffrage.jpg`, `gamme-interieur.jpg`, `chantier-1.jpg`, `chantier-2.jpg`, `chantier-3.jpg`, `og-image.jpg`. Les formats PNG et WebP sont aussi acceptés.
2. Lancez le pipeline :

```bash
cd tools
npm install
npm run images
```

Le script redimensionne, recadre et compresse chaque original dans les trois formats et les largeurs attendues par `index.html`. Les photos manquantes gardent leur visuel de substitution.

3. Pour un logo en meilleure définition, remplacez `images/src/logo.png` par le fichier officiel et relancez le pipeline : il régénère `logo-decoparis-512.png` et `logo-decoparis-header.png`.

## Vérifier localement

```bash
python3 -m http.server 8765
# puis ouvrir http://127.0.0.1:8765/
```

Lighthouse (mode mobile) peut être lancé avec `npx lighthouse http://127.0.0.1:8765/ --view`.

## Mise en ligne sur GitHub Pages

1. Fusionner la branche de travail dans `main`.
2. Dans le dépôt GitHub : Settings, puis Pages, puis Source : « GitHub Actions ». Le workflow `pages.yml` déploie ensuite la racine du dépôt à chaque push sur `main`.
3. La maquette est servie à l'adresse `https://fabiencollet64.github.io/decoparis/`.

La balise `<link rel="canonical">` pointe vers `https://decoparis.net/` afin de protéger le vrai site du contenu dupliqué.

## Points à confirmer avec le client

Tous les éléments non vérifiables sont marqués `[À CONFIRMER]`, `[CHANTIER À COMPLÉTER]` ou `[TÉMOIGNAGE CLIENT RÉEL À FOURNIR]` dans la page. La liste complète est fournie dans le compte rendu de livraison.
