<?php

namespace App\Service;

use App\Entity\Generation;
use App\Entity\User;
use App\Repository\GenerationRepository;
use Doctrine\ORM\EntityManagerInterface;

class GenerationService
{
    public function __construct(
        private readonly GenerationRepository $repository,
        private readonly EntityManagerInterface $em
    ) {}

    public function canGenerate(User $user): bool
    {
        $plan = $user->getPlan();
        if (!$plan) {
            return false;
        }

        $limit = $plan->getLimitGeneration();
        if ($limit === null) {
            return true;
        }

        return $this->repository->countTodayByUser($user) < $limit;
    }

    public function getQuota(User $user): array
    {
        $plan = $user->getPlan();
        if (!$plan) {
            return ['used' => 0, 'limit' => 0, 'remaining' => 0, 'hasPlan' => false];
        }

        $limit = $plan->getLimitGeneration() ?? 0;
        $used = $this->repository->countTodayByUser($user);

        return [
            'used' => $used,
            'limit' => $limit,
            'remaining' => max(0, $limit - $used),
            'hasPlan' => true,
        ];
    }

    public function record(User $user, string $tool): void
    {
        $generation = new Generation();
        $generation->setUser($user);
        $generation->setFile($tool);
        $generation->setCreatedAt(new \DateTime());

        $this->em->persist($generation);
        $this->em->flush();
    }
}
