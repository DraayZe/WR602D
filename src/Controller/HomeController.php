<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\PlanRepository;
use App\Repository\ToolRepository;


final class HomeController extends AbstractController
{
    #[Route('/', name: 'app_home')]
    public function index(PlanRepository $planRepository, ToolRepository $toolRepository): Response
    {
        // Sort plans by price to establish hierarchy (0=Gratuit, 1=Pro, 2=Premium)
        $allPlans = $planRepository->findBy([], ['price' => 'ASC']);
        $planLevels = [];
        foreach ($allPlans as $level => $plan) {
            $planLevels[$plan->getId()] = $level;
        }

        // Current user plan level (-1 = not logged in / no plan)
        $user = $this->getUser();
        $userPlanLevel = -1;
        if ($user && method_exists($user, 'getPlan') && $user->getPlan()) {
            $userPlanLevel = $planLevels[$user->getPlan()->getId()] ?? 0;
        }

        $plans = array_map(fn($p) => [
            'id' => $p->getId(),
            'name' => $p->getName(),
            'description' => $p->getDescription(),
            'price' => $p->getPrice(),
            'limitGeneration' => $p->getLimitGeneration(),
            'tool' => array_map(fn($t) => ['name' => $t->getName()], $p->getTools()->toArray()),
            'checkoutUrl' => $p->getStripePriceId() ? $this->generateUrl('app_payment_checkout', ['id' => $p->getId()]) : null,
        ], $allPlans);

        $tools = array_map(function($t) use ($planLevels) {
            $toolPlans = $t->getPlans()->toArray();
            $minLevel = empty($toolPlans) ? 0 : min(array_map(fn($p) => $planLevels[$p->getId()] ?? 0, $toolPlans));
            $requiredPlan = empty($toolPlans) ? null : array_reduce($toolPlans, function($carry, $p) use ($planLevels, $minLevel) {
                return ($planLevels[$p->getId()] ?? 0) === $minLevel ? $p : $carry;
            });

            return [
                'name' => $t->getName(),
                'icon' => $t->getIcon(),
                'color' => $t->getColor(),
                'description' => $t->getDescription(),
                'url' => $t->getRoute() ? $this->generateUrl($t->getRoute()) : null,
                'requiredPlanLevel' => $minLevel,
                'requiredPlanName' => $requiredPlan ? $requiredPlan->getName() : null,
            ];
        }, $toolRepository->findAll());

        return $this->render('home/index.html.twig', [
            'plans' => $plans,
            'tools' => $tools,
            'userPlanLevel' => $userPlanLevel,
            'loginUrl' => $this->generateUrl('app_login'),
            'registerUrl' => $this->generateUrl('app_register'),
            'isLogged' => (bool) $user,
        ]);
    }
}
