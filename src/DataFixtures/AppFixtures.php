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
        $manager->persist($planPro);

        // Plan premium
        $planPremium = new Plan();
        $planPremium->setName("Premium");
        $planPremium->setDescription("Pour les professionnels ou les entreprises.");
        $planPremium->setPrice(45);
        $planPremium->setLimitGeneration(200);
        $planPremium->setActive(true);
        $manager->persist($planPremium);


        $toolHTML = new Tool();
        $toolHTML->setName("HTML en PDF");
        $toolHTML->setIcon("fa-brands fa-html5");
        $toolHTML->setDescription("Convertissez une page HTML en PDF");
        $toolHTML->setColor("#EF4444");
        $toolHTML->setIsActive(true);
        $toolHTML->setRoute("app_tool_html_to_pdf");
        $toolHTML->addPlan($planFree);
        $manager->persist($toolHTML);

        $toolLien = new Tool();
        $toolLien->setName("Lien en PDF");
        $toolLien->setIcon("fa-solid fa-link");
        $toolLien->setDescription("Convertissez un lien en PDF");
        $toolLien->setColor("#EAB308");
        $toolLien->setIsActive(true);
        $toolLien->setRoute("app_tool_url_to_pdf");
        $toolLien->addPlan($planFree);
        $manager->persist($toolLien);

        $toolFusionner  = new Tool();
        $toolFusionner->setName("Fusionner des PDF");
        $toolFusionner->setIcon("fa-solid fa-code-merge");
        $toolFusionner->setDescription("Fusionnez vos fichiers PDFs en un seul");
        $toolFusionner->setColor("#22C55E");
        $toolFusionner->setIsActive(true);
        $toolFusionner->setRoute(null);
        $toolFusionner->addPlan($planFree);
        $manager->persist($toolFusionner);

        $toolCompresser  = new Tool();
        $toolCompresser->setName("Compresser un PDF");
        $toolCompresser->setIcon("fa-solid fa-down-left-and-up-right-to-center");
        $toolCompresser->setDescription("Réduisez la taille de votre fichier PDF");
        $toolCompresser->setColor("#3B82F6");
        $toolCompresser->setIsActive(true);
        $toolCompresser->setRoute(null);
        $toolCompresser->addPlan($planFree);
        $manager->persist($toolCompresser);

        $toolWord = new Tool();
        $toolWord->setName("Word en PDF");
        $toolWord->setIcon("fa-brands fa-wordpress-simple");
        $toolWord->setDescription("Convertissez un fichier word en PDF");
        $toolWord->setColor("#08e2ea");
        $toolWord->setIsActive(true);
        $toolWord->setRoute(null);
        $toolWord->addPlan($planPro);
        $manager->persist($toolWord);

        $toolImage = new Tool();
        $toolImage->setName("Image en PDF");
        $toolImage->setIcon("fa-regular fa-image");
        $toolImage->setDescription("Convertissez une image (PNG, JPEG, JPG) en PDF");
        $toolImage->setColor("#EC4899");
        $toolImage->setIsActive(true);
        $toolImage->setRoute(null);
        $toolImage->addPlan($planPro);
        $manager->persist($toolImage);

        $manager->flush();
    }


}
