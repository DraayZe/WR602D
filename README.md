WR602D - Projet scolaire

Commande pour lancer les watchers :

- react : se mettre dans le dossier et lancer -> cd assets/react/build && npm run watch

- tailwind : à la racine -> php bin/console tailwind:build --watch

## Outils LarryPDF par plan

> Tous les outils utilisent Gotenberg (conteneur Docker sur le port 3009).
> ❌ = non faisable avec Gotenberg, nécessite un service externe.

### Plan Gratuit
- **HTML en PDF** ✅ (fait)
- **Lien en PDF** ✅ (fait)
- **Fusionner des PDF** - combiner plusieurs PDF en un seul
- **Compresser un PDF** - réduire la taille du fichier

### Plan Pro
- **Word en PDF** (.docx → PDF) - via LibreOffice (Gotenberg)
- **Image en PDF** (JPG/PNG → PDF) - via Gotenberg
- **PDF en Image** (PDF → JPG/PNG) - via Gotenberg
- **Diviser un PDF** - extraire des pages spécifiques
- **Protéger un PDF** - ajouter un mot de passe
- **Déverrouiller un PDF** - retirer la protection

### Plan Premium
- **Excel en PDF** (.xlsx → PDF) - via LibreOffice (Gotenberg)
- **PowerPoint en PDF** (.pptx → PDF) - via LibreOffice (Gotenberg)
- **Filigraner un PDF** - ajouter un watermark texte/image
- **PDF en Word** (.docx) ❌ - service externe requis
- **PDF en Excel** (.xlsx) ❌ - service externe requis
- **OCR** ❌ - Tesseract non inclus dans Gotenberg
- **Signer un PDF** ❌ - nécessite une lib PHP dédiée
