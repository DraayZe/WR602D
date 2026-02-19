<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ReactTestController extends AbstractController
{
    #[Route('/test-react', name: 'app_react_test')]
    public function index(): Response
    {
        return $this->render('react/index.html.twig');
    }
}
