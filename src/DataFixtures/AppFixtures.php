<?php

namespace App\DataFixtures;

use App\Entity\Plan;
use App\Entity\Tool;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // Plan gratuit
        $planFree = new Plan();
        $planFree->setName("Gratuit");
        $planFree->setDescription("La formule parfaite pour commencer et prendre en main.");
        $planFree->setPrice(0);
        $planFree->setLimitGeneration(5);
        $planFree->setActive(true);
        $manager->persist($planFree);

        // Plan pro
        $planPro = new Plan();
        $planPro->setName("Pro");
        $planPro->setDescription("Pour une utilisation régulière et un besoin vital.");
        $planPro->setPrice(9.9);
        $planPro->setLimitGeneration(20);
        $planPro->setActive(true);
        $planPro->setStripePriceId("price_1T9L632NjawVyw3STEBuOIAj");
        $manager->persist($planPro);

        // Plan premium
        $planPremium = new Plan();
        $planPremium->setName("Premium");
        $planPremium->setDescription("Pour les professionnels ou les entreprises.");
        $planPremium->setPrice(45);
        $planPremium->setLimitGeneration(200);
        $planPremium->setActive(true);
        $planPremium->setStripePriceId("price_1T9L6d2NjawVyw3Sd6jEtXsd");
        $manager->persist($planPremium);

        // ── Plan Gratuit ──────────────────────────────────────────────────────

        $toolHTML = new Tool();
        $toolHTML->setName("HTML en PDF");
        $toolHTML->setIcon("fa-brands fa-html5");
        $toolHTML->setDescription("Convertissez une page HTML en PDF");
        $toolHTML->setColor("#EF4444");
        $toolHTML->setIsActive(true);
        $toolHTML->setRoute("app_convert_html");
        $toolHTML->addPlan($planFree);
        $manager->persist($toolHTML);

        $toolLien = new Tool();
        $toolLien->setName("Lien en PDF");
        $toolLien->setIcon("fa-solid fa-link");
        $toolLien->setDescription("Convertissez un lien en PDF");
        $toolLien->setColor("#EAB308");
        $toolLien->setIsActive(true);
        $toolLien->setRoute("app_convert_url");
        $toolLien->addPlan($planFree);
        $manager->persist($toolLien);

        $toolFusionner = new Tool();
        $toolFusionner->setName("Fusionner des PDF");
        $toolFusionner->setIcon("fa-solid fa-code-merge");
        $toolFusionner->setDescription("Fusionnez vos fichiers PDFs en un seul");
        $toolFusionner->setColor("#22C55E");
        $toolFusionner->setIsActive(true);
        $toolFusionner->setRoute("app_convert_merge");
        $toolFusionner->addPlan($planFree);
        $manager->persist($toolFusionner);

        $toolWysiwyg = new Tool();
        $toolWysiwyg->setName("Éditeur WYSIWYG");
        $toolWysiwyg->setIcon("fa-solid fa-pen-to-square");
        $toolWysiwyg->setDescription("Rédigez votre document et exportez-le en PDF");
        $toolWysiwyg->setColor("#8B5CF6");
        $toolWysiwyg->setIsActive(true);
        $toolWysiwyg->setRoute("app_convert_wysiwyg");
        $toolWysiwyg->addPlan($planFree);
        $manager->persist($toolWysiwyg);

        $toolCompresser = new Tool();
        $toolCompresser->setName("Compresser un PDF");
        $toolCompresser->setIcon("fa-solid fa-down-left-and-up-right-to-center");
        $toolCompresser->setDescription("Réduisez la taille de votre fichier PDF");
        $toolCompresser->setColor("#3B82F6");
        $toolCompresser->setIsActive(true);
        $toolCompresser->setRoute(null);
        $toolCompresser->addPlan($planFree);
        $manager->persist($toolCompresser);

        // ── Plan Pro ──────────────────────────────────────────────────────────

        $toolOffice = new Tool();
        $toolOffice->setName("Office en PDF");
        $toolOffice->setIcon("fa-solid fa-file-word");
        $toolOffice->setDescription("Convertissez Word, Excel ou PowerPoint en PDF");
        $toolOffice->setColor("#08e2ea");
        $toolOffice->setIsActive(true);
        $toolOffice->setRoute("app_convert_office");
        $toolOffice->addPlan($planPro);
        $manager->persist($toolOffice);

        $toolMarkdown = new Tool();
        $toolMarkdown->setName("Markdown en PDF");
        $toolMarkdown->setIcon("fa-brands fa-markdown");
        $toolMarkdown->setDescription("Convertissez un fichier Markdown (.md) en PDF");
        $toolMarkdown->setColor("#6366F1");
        $toolMarkdown->setIsActive(true);
        $toolMarkdown->setRoute("app_convert_markdown");
        $toolMarkdown->addPlan($planPro);
        $manager->persist($toolMarkdown);

        $toolScreenshot = new Tool();
        $toolScreenshot->setName("Capture d'écran");
        $toolScreenshot->setIcon("fa-solid fa-camera");
        $toolScreenshot->setDescription("Capturez n'importe quelle page web en image PNG");
        $toolScreenshot->setColor("#F59E0B");
        $toolScreenshot->setIsActive(true);
        $toolScreenshot->setRoute("app_convert_screenshot");
        $toolScreenshot->addPlan($planPro);
        $manager->persist($toolScreenshot);

        $toolImage = new Tool();
        $toolImage->setName("Image en PDF");
        $toolImage->setIcon("fa-regular fa-image");
        $toolImage->setDescription("Convertissez une image (PNG, JPEG, JPG) en PDF");
        $toolImage->setColor("#EC4899");
        $toolImage->setIsActive(true);
        $toolImage->setRoute("app_tool_image_to_pdf");
        $toolImage->addPlan($planPro);
        $manager->persist($toolImage);

        $toolDiviser = new Tool();
        $toolDiviser->setName("Diviser un PDF");
        $toolDiviser->setIcon("fa-solid fa-divide");
        $toolDiviser->setDescription("Divisez votre PDF en plusieurs fichiers");
        $toolDiviser->setColor("#F97316");
        $toolDiviser->setIsActive(true);
        $toolDiviser->setRoute("app_tool_split_pdf");
        $toolDiviser->addPlan($planPro);
        $manager->persist($toolDiviser);

        // ── Plan Premium ──────────────────────────────────────────────────────

        $toolExcel = new Tool();
        $toolExcel->setName("Excel en PDF");
        $toolExcel->setIcon("fa-solid fa-table");
        $toolExcel->setDescription("Convertissez un fichier Excel en PDF");
        $toolExcel->setColor("#16A34A");
        $toolExcel->setIsActive(true);
        $toolExcel->setRoute("app_convert_office");
        $toolExcel->addPlan($planPremium);
        $manager->persist($toolExcel);

        $toolPowerPoint = new Tool();
        $toolPowerPoint->setName("PowerPoint en PDF");
        $toolPowerPoint->setIcon("fa-solid fa-display");
        $toolPowerPoint->setDescription("Convertissez une présentation PowerPoint en PDF");
        $toolPowerPoint->setColor("#EA580C");
        $toolPowerPoint->setIsActive(true);
        $toolPowerPoint->setRoute("app_convert_office");
        $toolPowerPoint->addPlan($planPremium);
        $manager->persist($toolPowerPoint);

        $manager->flush();
    }
}
