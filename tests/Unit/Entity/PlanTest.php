<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Plan;
use App\Entity\Tool;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class PlanTest extends TestCase
{
    private Plan $plan;

    protected function setUp(): void
    {
        $this->plan = new Plan();
    }

    public function testIdIsNullByDefault(): void
    {
        $this->assertNull($this->plan->getId());
    }

    public function testNameGetterAndSetter(): void
    {
        $this->plan->setName('Premium');
        $this->assertSame('Premium', $this->plan->getName());
    }

    public function testDescriptionGetterAndSetter(): void
    {
        $this->plan->setDescription('Plan premium avec accès illimité');
        $this->assertSame('Plan premium avec accès illimité', $this->plan->getDescription());
    }

    public function testLimitGenerationGetterAndSetter(): void
    {
        $this->assertNull($this->plan->getLimitGeneration());
        $this->plan->setLimitGeneration(10);
        $this->assertSame(10, $this->plan->getLimitGeneration());
        $this->plan->setLimitGeneration(null);
        $this->assertNull($this->plan->getLimitGeneration());
    }

    public function testPriceGetterAndSetter(): void
    {
        $this->plan->setPrice('9.99');
        $this->assertSame('9.99', $this->plan->getPrice());
    }

    public function testSpecialPriceGetterAndSetter(): void
    {
        $this->assertNull($this->plan->getSpecialPrice());
        $this->plan->setSpecialPrice('7.99');
        $this->assertSame('7.99', $this->plan->getSpecialPrice());
    }

    public function testSpecialPriceDatesGetterAndSetter(): void
    {
        $from = new \DateTime('2024-01-01');
        $to = new \DateTime('2024-01-31');
        $this->plan->setSpecialPriceFrom($from);
        $this->plan->setSpecialPriceTo($to);
        $this->assertSame($from, $this->plan->getSpecialPriceFrom());
        $this->assertSame($to, $this->plan->getSpecialPriceTo());
    }

    public function testActiveGetterAndSetter(): void
    {
        $this->plan->setActive(true);
        $this->assertTrue($this->plan->isActive());
        $this->plan->setActive(false);
        $this->assertFalse($this->plan->isActive());
    }

    public function testImageGetterAndSetter(): void
    {
        $this->assertNull($this->plan->getImage());
        $this->plan->setImage('premium.png');
        $this->assertSame('premium.png', $this->plan->getImage());
    }

    public function testRoleGetterAndSetter(): void
    {
        $this->assertNull($this->plan->getRole());
        $this->plan->setRole('ROLE_PREMIUM');
        $this->assertSame('ROLE_PREMIUM', $this->plan->getRole());
    }

    public function testStripePriceIdGetterAndSetter(): void
    {
        $this->plan->setStripePriceId('price_123abc');
        $this->assertSame('price_123abc', $this->plan->getStripePriceId());
    }

    public function testUsersIsEmptyByDefault(): void
    {
        $this->assertCount(0, $this->plan->getUsers());
    }

    public function testAddUser(): void
    {
        $user = new User();
        $this->plan->addUser($user);
        $this->assertCount(1, $this->plan->getUsers());
        $this->assertSame($this->plan, $user->getPlan());
    }

    public function testAddUserNoDuplicates(): void
    {
        $user = new User();
        $this->plan->addUser($user);
        $this->plan->addUser($user);
        $this->assertCount(1, $this->plan->getUsers());
    }

    public function testRemoveUser(): void
    {
        $user = new User();
        $this->plan->addUser($user);
        $this->plan->removeUser($user);
        $this->assertCount(0, $this->plan->getUsers());
        $this->assertNull($user->getPlan());
    }

    public function testToolsIsEmptyByDefault(): void
    {
        $this->assertCount(0, $this->plan->getTools());
    }

    public function testAddTool(): void
    {
        $tool = new Tool();
        $this->plan->addTool($tool);
        $this->assertCount(1, $this->plan->getTools());
        $this->assertTrue($this->plan->getTools()->contains($tool));
    }

    public function testAddToolNoDuplicates(): void
    {
        $tool = new Tool();
        $this->plan->addTool($tool);
        $this->plan->addTool($tool);
        $this->assertCount(1, $this->plan->getTools());
    }

    public function testRemoveTool(): void
    {
        $tool = new Tool();
        $this->plan->addTool($tool);
        $this->plan->removeTool($tool);
        $this->assertCount(0, $this->plan->getTools());
    }
}
