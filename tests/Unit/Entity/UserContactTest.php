<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Generation;
use App\Entity\User;
use App\Entity\UserContact;
use PHPUnit\Framework\TestCase;

class UserContactTest extends TestCase
{
    private UserContact $contact;

    protected function setUp(): void
    {
        $this->contact = new UserContact();
    }

    public function testIdIsNullByDefault(): void
    {
        $this->assertNull($this->contact->getId());
    }

    public function testLastnameGetterAndSetter(): void
    {
        $this->contact->setLastname('Martin');
        $this->assertSame('Martin', $this->contact->getLastname());
    }

    public function testFirstnameGetterAndSetter(): void
    {
        $this->contact->setFirstname('Sophie');
        $this->assertSame('Sophie', $this->contact->getFirstname());
    }

    public function testEmailGetterAndSetter(): void
    {
        $this->contact->setEmail('sophie.martin@example.com');
        $this->assertSame('sophie.martin@example.com', $this->contact->getEmail());
    }

    public function testUserGetterAndSetter(): void
    {
        $this->assertNull($this->contact->getUser());
        $user = new User();
        $this->contact->setUser($user);
        $this->assertSame($user, $this->contact->getUser());
        $this->contact->setUser(null);
        $this->assertNull($this->contact->getUser());
    }

    public function testGenerationsIsEmptyByDefault(): void
    {
        $this->assertCount(0, $this->contact->getGenerations());
    }

    public function testAddGeneration(): void
    {
        $generation = new Generation();
        $this->contact->addGeneration($generation);
        $this->assertCount(1, $this->contact->getGenerations());
        $this->assertTrue($this->contact->getGenerations()->contains($generation));
        $this->assertTrue($generation->getUserContacts()->contains($this->contact));
    }

    public function testAddGenerationNoDuplicates(): void
    {
        $generation = new Generation();
        $this->contact->addGeneration($generation);
        $this->contact->addGeneration($generation);
        $this->assertCount(1, $this->contact->getGenerations());
    }

    public function testRemoveGeneration(): void
    {
        $generation = new Generation();
        $this->contact->addGeneration($generation);
        $this->contact->removeGeneration($generation);
        $this->assertCount(0, $this->contact->getGenerations());
        $this->assertFalse($generation->getUserContacts()->contains($this->contact));
    }
}
