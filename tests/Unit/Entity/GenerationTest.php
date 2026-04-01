<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Generation;
use App\Entity\User;
use App\Entity\UserContact;
use PHPUnit\Framework\TestCase;

class GenerationTest extends TestCase
{
    private Generation $generation;

    protected function setUp(): void
    {
        $this->generation = new Generation();
    }

    public function testIdIsNullByDefault(): void
    {
        $this->assertNull($this->generation->getId());
    }

    public function testUserGetterAndSetter(): void
    {
        $this->assertNull($this->generation->getUser());
        $user = new User();
        $this->generation->setUser($user);
        $this->assertSame($user, $this->generation->getUser());
        $this->generation->setUser(null);
        $this->assertNull($this->generation->getUser());
    }

    public function testFileGetterAndSetter(): void
    {
        $this->generation->setFile('output.pdf');
        $this->assertSame('output.pdf', $this->generation->getFile());
    }

    public function testCreatedAtGetterAndSetter(): void
    {
        $date = new \DateTime('2024-06-15 10:00:00');
        $this->generation->setCreatedAt($date);
        $this->assertSame($date, $this->generation->getCreatedAt());
    }

    public function testUserContactsIsEmptyByDefault(): void
    {
        $this->assertCount(0, $this->generation->getUserContacts());
    }

    public function testAddUserContact(): void
    {
        $contact = new UserContact();
        $this->generation->addUserContact($contact);
        $this->assertCount(1, $this->generation->getUserContacts());
        $this->assertTrue($this->generation->getUserContacts()->contains($contact));
    }

    public function testAddUserContactNoDuplicates(): void
    {
        $contact = new UserContact();
        $this->generation->addUserContact($contact);
        $this->generation->addUserContact($contact);
        $this->assertCount(1, $this->generation->getUserContacts());
    }

    public function testRemoveUserContact(): void
    {
        $contact = new UserContact();
        $this->generation->addUserContact($contact);
        $this->generation->removeUserContact($contact);
        $this->assertCount(0, $this->generation->getUserContacts());
    }
}
