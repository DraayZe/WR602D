<?php

namespace App\Tests\Unit\Service;

use App\Entity\Generation;
use App\Entity\Plan;
use App\Entity\User;
use App\Repository\GenerationRepository;
use App\Service\GenerationService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class GenerationServiceTest extends TestCase
{
    private GenerationRepository&MockObject $repository;
    private EntityManagerInterface&MockObject $em;
    private GenerationService $service;

    protected function setUp(): void
    {
        $this->repository = $this->createMock(GenerationRepository::class);
        $this->em = $this->createMock(EntityManagerInterface::class);
        $this->service = new GenerationService($this->repository, $this->em);
    }

    public function testCanGenerateReturnsFalseWhenUserHasNoPlan(): void
    {
        $user = new User();
        $this->assertFalse($this->service->canGenerate($user));
    }

    public function testCanGenerateReturnsTrueWhenLimitIsNull(): void
    {
        $plan = new Plan();
        $plan->setLimitGeneration(null);

        $user = new User();
        $user->setPlan($plan);

        $this->repository->expects($this->never())->method('countTodayByUser');

        $this->assertTrue($this->service->canGenerate($user));
    }

    public function testCanGenerateReturnsTrueWhenUnderLimit(): void
    {
        $plan = new Plan();
        $plan->setLimitGeneration(5);

        $user = new User();
        $user->setPlan($plan);

        $this->repository->expects($this->once())
            ->method('countTodayByUser')
            ->with($user)
            ->willReturn(3);

        $this->assertTrue($this->service->canGenerate($user));
    }

    public function testCanGenerateReturnsFalseWhenAtLimit(): void
    {
        $plan = new Plan();
        $plan->setLimitGeneration(5);

        $user = new User();
        $user->setPlan($plan);

        $this->repository->expects($this->once())
            ->method('countTodayByUser')
            ->with($user)
            ->willReturn(5);

        $this->assertFalse($this->service->canGenerate($user));
    }

    public function testCanGenerateReturnsFalseWhenOverLimit(): void
    {
        $plan = new Plan();
        $plan->setLimitGeneration(5);

        $user = new User();
        $user->setPlan($plan);

        $this->repository->expects($this->once())
            ->method('countTodayByUser')
            ->with($user)
            ->willReturn(7);

        $this->assertFalse($this->service->canGenerate($user));
    }

    public function testGetQuotaWhenNoPlan(): void
    {
        $user = new User();

        $quota = $this->service->getQuota($user);

        $this->assertSame(0, $quota['used']);
        $this->assertSame(0, $quota['limit']);
        $this->assertSame(0, $quota['remaining']);
        $this->assertFalse($quota['hasPlan']);
    }

    public function testGetQuotaWithPlanAndRemainingGenerations(): void
    {
        $plan = new Plan();
        $plan->setLimitGeneration(10);

        $user = new User();
        $user->setPlan($plan);

        $this->repository->expects($this->once())
            ->method('countTodayByUser')
            ->with($user)
            ->willReturn(3);

        $quota = $this->service->getQuota($user);

        $this->assertSame(3, $quota['used']);
        $this->assertSame(10, $quota['limit']);
        $this->assertSame(7, $quota['remaining']);
        $this->assertTrue($quota['hasPlan']);
    }

    public function testGetQuotaRemainingNeverNegative(): void
    {
        $plan = new Plan();
        $plan->setLimitGeneration(5);

        $user = new User();
        $user->setPlan($plan);

        $this->repository->expects($this->once())
            ->method('countTodayByUser')
            ->willReturn(8);

        $quota = $this->service->getQuota($user);

        $this->assertSame(0, $quota['remaining']);
    }

    public function testGetQuotaWithNullLimit(): void
    {
        $plan = new Plan();
        $plan->setLimitGeneration(null);

        $user = new User();
        $user->setPlan($plan);

        $this->repository->expects($this->once())
            ->method('countTodayByUser')
            ->with($user)
            ->willReturn(2);

        $quota = $this->service->getQuota($user);

        $this->assertSame(2, $quota['used']);
        $this->assertSame(0, $quota['limit']);
        $this->assertSame(0, $quota['remaining']);
        $this->assertTrue($quota['hasPlan']);
    }

    public function testRecordPersistsAndFlushesGeneration(): void
    {
        $user = new User();

        $this->em->expects($this->once())
            ->method('persist')
            ->with($this->callback(function (Generation $generation) use ($user) {
                return $generation->getUser() === $user
                    && $generation->getFile() === 'pdf_merge'
                    && $generation->getCreatedAt() instanceof \DateTime;
            }));

        $this->em->expects($this->once())->method('flush');

        $this->service->record($user, 'pdf_merge');
    }
}
