<?php

namespace App\Repository;

use App\Entity\Generation;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Generation>
 */
class GenerationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Generation::class);
    }

    /**
     * @return Generation[]
     */
    public function findByUserOrderedByDate(User $user): array
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.user = :user')
            ->setParameter('user', $user)
            ->orderBy('g.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function countTodayByUser(User $user): int
    {
        return (int) $this->createQueryBuilder('g')
            ->select('COUNT(g.id)')
            ->andWhere('g.user = :user')
            ->andWhere('g.createdAt >= :start')
            ->andWhere('g.createdAt < :end')
            ->setParameter('user', $user)
            ->setParameter('start', new \DateTime('today'))
            ->setParameter('end', new \DateTime('tomorrow'))
            ->getQuery()
            ->getSingleScalarResult();
    }
}
