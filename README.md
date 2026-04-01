# LarryPDF — WR602D

Application web de manipulation de fichiers PDF, développée en Symfony 7.4 dans le cadre d'un projet scolaire.

## Liens

| Service | URL |
|---------|-----|
| Application | https://wr602d.lennyfernet.fr/ |
| phpMyAdmin | https://phpmyadmin.lennyfernet.fr/ |
| Mailpit (emails) | https://mailpit.lennyfernet.fr/ |

## Description

LarryPDF permet aux utilisateurs de convertir, fusionner, compresser et manipuler des fichiers PDF directement depuis leur navigateur. L'accès aux outils est conditionné par un plan d'abonnement (Gratuit, Pro, Premium) avec un quota journalier de générations. Les conversions sont réalisées via **Gotenberg** (conteneur Docker).

## Stack technique

- **Framework** : Symfony 7.4
- **Frontend** : Tailwind CSS v4 (via `symfonycasts/tailwind-bundle`), AssetMapper, Stimulus, Turbo
- **Base de données** : MySQL / Doctrine ORM
- **Paiement** : Stripe
- **Conversion PDF** : Gotenberg (port 3009)
- **Emails** : Symfony Mailer (Mailpit en dev)
- **Tests** : PHPUnit 12

## Outils disponibles par plan

> Tous les outils de conversion utilisent Gotenberg (conteneur Docker sur le port 3009).
> ❌ = non faisable avec Gotenberg, nécessite un service externe.

### Plan Gratuit
- **HTML en PDF** ✅
- **Lien en PDF** ✅
- **Fusionner des PDF** — combiner plusieurs PDF en un seul
- **Compresser un PDF** — réduire la taille du fichier

### Plan Pro
- **Word en PDF** (.docx → PDF) — via LibreOffice (Gotenberg)
- **Image en PDF** (JPG/PNG → PDF) — via Gotenberg
- **PDF en Image** (PDF → JPG/PNG) — via Gotenberg
- **Diviser un PDF** — extraire des pages spécifiques
- **Protéger un PDF** — ajouter un mot de passe
- **Déverrouiller un PDF** — retirer la protection

### Plan Premium
- **Excel en PDF** (.xlsx → PDF) — via LibreOffice (Gotenberg)
- **PowerPoint en PDF** (.pptx → PDF) — via LibreOffice (Gotenberg)
- **Filigraner un PDF** — ajouter un watermark texte/image
- **PDF en Word** (.docx) ❌ — service externe requis
- **PDF en Excel** (.xlsx) ❌ — service externe requis
- **OCR** ❌ — Tesseract non inclus dans Gotenberg
- **Signer un PDF** ❌ — nécessite une lib PHP dédiée

## Installation

```bash
composer install
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load
```

## Lancer les watchers

```bash
# Tailwind (à la racine)
php bin/console tailwind:build --watch

# React (si applicable)
cd assets/react/build && npm run watch
```

## Tests

```bash
php bin/phpunit tests/Unit/
```
