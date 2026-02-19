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

        $plans = $planRepository->findAll();
        $tools = $toolRepository->findAll();

        return $this->render('home/index.html.twig', [
            'plans' => $plans,
            'tools' => $tools,
        ]);
    }
}
