<?php

namespace App\Tests\Unit\Twig;

use App\Entity\Plan;
use App\Repository\PlanRepository;
use App\Twig\PlanExtension;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class PlanExtensionTest extends TestCase
{
    private PlanRepository&MockObject $planRepository;
    private PlanExtension $extension;

    protected function setUp(): void
    {
        $this->planRepository = $this->createMock(PlanRepository::class);
        $this->extension = new PlanExtension($this->planRepository);
    }

    public function testGetGlobalsReturnsActivePlansArray(): void
    {
        $plan1 = new Plan();
        $plan1->setName('Starter');
        $plan1->setPrice('0.00');
        $plan1->setDescription('Plan gratuit');
        $plan1->setLimitGeneration(5);
        $plan1->setActive(true);

        $plan2 = new Plan();
        $plan2->setName('Premium');
        $plan2->setPrice('9.99');
        $plan2->setDescription('Plan premium');
        $plan2->setLimitGeneration(null);
        $plan2->setActive(true);

        $this->planRepository->expects($this->once())
            ->method('findBy')
            ->with(['active' => true])
            ->willReturn([$plan1, $plan2]);

        $globals = $this->extension->getGlobals();

        $this->assertArrayHasKey('active_plans', $globals);
        $this->assertCount(2, $globals['active_plans']);

        $firstPlan = $globals['active_plans'][0];
        $this->assertSame('Starter', $firstPlan['name']);
        $this->assertSame(0.0, $firstPlan['price']);
        $this->assertSame('Plan gratuit', $firstPlan['description']);
        $this->assertSame(5, $firstPlan['limitGeneration']);

        $secondPlan = $globals['active_plans'][1];
        $this->assertSame('Premium', $secondPlan['name']);
        $this->assertSame(9.99, $secondPlan['price']);
        $this->assertNull($secondPlan['limitGeneration']);
    }

    public function testGetGlobalsWithNoActivePlans(): void
    {
        $this->planRepository->expects($this->once())
            ->method('findBy')
            ->with(['active' => true])
            ->willReturn([]);

        $globals = $this->extension->getGlobals();

        $this->assertArrayHasKey('active_plans', $globals);
        $this->assertCount(0, $globals['active_plans']);
    }

    public function testGetGlobalsPlanStructureContainsRequiredKeys(): void
    {
        $plan = new Plan();
        $plan->setName('Basic');
        $plan->setPrice('4.99');
        $plan->setDescription('Plan basique');
        $plan->setLimitGeneration(3);

        $this->planRepository->expects($this->once())
            ->method('findBy')
            ->willReturn([$plan]);

        $globals = $this->extension->getGlobals();
        $planData = $globals['active_plans'][0];

        $this->assertArrayHasKey('id', $planData);
        $this->assertArrayHasKey('name', $planData);
        $this->assertArrayHasKey('price', $planData);
        $this->assertArrayHasKey('description', $planData);
        $this->assertArrayHasKey('limitGeneration', $planData);
    }
}
