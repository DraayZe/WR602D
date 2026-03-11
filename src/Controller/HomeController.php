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

        $plans = array_map(fn($p) => [
            'id' => $p->getId(),
            'name' => $p->getName(),
            'description' => $p->getDescription(),
            'price' => $p->getPrice(),
            'limitGeneration' => $p->getLimitGeneration(),
            'tool' => array_map(fn($t) => ['name' => $t->getName()], $p->getTools()->toArray()),
            'checkoutUrl' => $p->getStripePriceId() ? $this->generateUrl('app_payment_checkout', ['id' => $p->getId()]) : null,
        ], $planRepository->findAll());

        $tools = array_map(fn($t) => [
            'name' => $t->getName(),
            'icon' => $t->getIcon(),
            'color' => $t->getColor(),
            'description' => $t->getDescription(),
            'url' => $t->getRoute() ? $this->generateUrl($t->getRoute()) : null,
        ], $toolRepository->findAll());

        return $this->render('home/index.html.twig', [
            'plans' => $plans,
            'tools' => $tools,
        ]);
    }
}
