<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Plan;
use App\Entity\Tool;
use PHPUnit\Framework\TestCase;

class ToolTest extends TestCase
{
    private Tool $tool;

    protected function setUp(): void
    {
        $this->tool = new Tool();
    }

    public function testIdIsNullByDefault(): void
    {
        $this->assertNull($this->tool->getId());
    }

    public function testNameGetterAndSetter(): void
    {
        $this->tool->setName('PDF Merger');
        $this->assertSame('PDF Merger', $this->tool->getName());
    }

    public function testIconGetterAndSetter(): void
    {
        $this->tool->setIcon('fa-file-pdf');
        $this->assertSame('fa-file-pdf', $this->tool->getIcon());
    }

    public function testDescriptionGetterAndSetter(): void
    {
        $this->tool->setDescription('Fusionne plusieurs PDF en un seul');
        $this->assertSame('Fusionne plusieurs PDF en un seul', $this->tool->getDescription());
    }

    public function testColorGetterAndSetter(): void
    {
        $this->tool->setColor('#B155FF');
        $this->assertSame('#B155FF', $this->tool->getColor());
    }

    public function testIsActiveGetterAndSetter(): void
    {
        $this->tool->setIsActive(true);
        $this->assertTrue($this->tool->isActive());
        $this->tool->setIsActive(false);
        $this->assertFalse($this->tool->isActive());
    }

    public function testRouteGetterAndSetter(): void
    {
        $this->assertNull($this->tool->getRoute());
        $this->tool->setRoute('app_pdf_merge');
        $this->assertSame('app_pdf_merge', $this->tool->getRoute());
        $this->tool->setRoute(null);
        $this->assertNull($this->tool->getRoute());
    }

    public function testPlansIsEmptyByDefault(): void
    {
        $this->assertCount(0, $this->tool->getPlans());
    }

    public function testAddPlan(): void
    {
        $plan = new Plan();
        $this->tool->addPlan($plan);
        $this->assertCount(1, $this->tool->getPlans());
        $this->assertTrue($this->tool->getPlans()->contains($plan));
    }

    public function testAddPlanNoDuplicates(): void
    {
        $plan = new Plan();
        $this->tool->addPlan($plan);
        $this->tool->addPlan($plan);
        $this->assertCount(1, $this->tool->getPlans());
    }

    public function testRemovePlan(): void
    {
        $plan = new Plan();
        $this->tool->addPlan($plan);
        $this->tool->removePlan($plan);
        $this->assertCount(0, $this->tool->getPlans());
    }
}
