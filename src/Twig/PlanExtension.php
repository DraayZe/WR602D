<?php

namespace App\Twig;

use App\Repository\PlanRepository;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;

class PlanExtension extends AbstractExtension implements GlobalsInterface
{
    public function __construct(private PlanRepository $planRepository)
    {
    }

    public function getGlobals(): array
    {
        return [
            'active_plans' => array_map(fn($p) => [
                'id' => $p->getId(),
                'name' => $p->getName(),
                'price' => (float) $p->getPrice(),
                'description' => $p->getDescription(),
                'limitGeneration' => $p->getLimitGeneration(),
            ], $this->planRepository->findBy(['active' => true])),
        ];
    }
}
