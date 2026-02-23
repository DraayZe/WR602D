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
        $planFree->setName("FREE");
        $planFree->setDescription("Abonnement gratuit");
        $planFree->setPrice(0);
        $planFree->setLimitGeneration(2);
        $planFree->setActive(true);

        $manager->persist($planFree);

        // Plan basic
        $planBasic = new Plan();
        $planBasic->setName("BASIC");
        $planBasic->setDescription("Abonnement basic : 20 générations par jour");
        $planBasic->setPrice(9.9);
        $planBasic->setLimitGeneration(20);
        $planBasic->setActive(true);
        $manager->persist($planBasic);

        // Plan premium
        $planPremium = new Plan();
        $planPremium->setName("PREMIUM");
        $planPremium->setDescription("Abonnement PREMIUM : 200 générations par jour");
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
        $toolHTML->addPlan($planFree);
        $manager->persist($toolHTML);

        $toolLien = new Tool();
        $toolLien->setName("Lien en PDF");
        $toolLien->setIcon("fa-solid fa-link");
        $toolLien->setDescription("Convertissez un lien en PDF");
        $toolLien->setColor("#EAB308");
        $toolLien->setIsActive(true);
        $toolLien->addPlan($planFree);
        $manager->persist($toolLien);

        $toolFusionner  = new Tool();
        $toolFusionner->setName("Fusionner des PDF");
        $toolFusionner->setIcon("fa-solid fa-code-merge");
        $toolFusionner->setDescription("Fusionnez vos fichiers PDFs en un seul");
        $toolFusionner->setColor("#22C55E");
        $toolFusionner->setIsActive(true);
        $toolFusionner->addPlan($planFree);
        $manager->persist($toolFusionner);

        $toolCompresser  = new Tool();
        $toolCompresser->setName("Compresser un PDF");
        $toolCompresser->setIcon("fa-solid fa-down-left-and-up-right-to-center");
        $toolCompresser->setDescription("Réduisez la taille de votre fichier PDF");
        $toolCompresser->setColor("#3B82F6");
        $toolCompresser->setIsActive(true);
        $toolCompresser->addPlan($planFree);
        $manager->persist($toolCompresser);

        $manager->flush();
    }


}
