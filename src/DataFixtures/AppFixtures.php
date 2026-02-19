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

        $manager->flush();
    }


}
