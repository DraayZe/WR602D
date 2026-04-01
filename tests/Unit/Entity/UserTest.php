<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Generation;
use App\Entity\Plan;
use App\Entity\User;
use App\Entity\UserContact;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    private User $user;

    protected function setUp(): void
    {
        $this->user = new User();
    }

    public function testIdIsNullByDefault(): void
    {
        $this->assertNull($this->user->getId());
    }

    public function testEmailGetterAndSetter(): void
    {
        $this->assertNull($this->user->getEmail());
        $this->user->setEmail('test@example.com');
        $this->assertSame('test@example.com', $this->user->getEmail());
    }

    public function testGetUserIdentifierReturnsEmail(): void
    {
        $this->user->setEmail('user@test.com');
        $this->assertSame('user@test.com', $this->user->getUserIdentifier());
    }

    public function testGetRolesAlwaysIncludesRoleUser(): void
    {
        $roles = $this->user->getRoles();
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testGetRolesWithCustomRole(): void
    {
        $this->user->setRoles(['ROLE_ADMIN']);
        $roles = $this->user->getRoles();
        $this->assertContains('ROLE_ADMIN', $roles);
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testGetRolesNoDuplicates(): void
    {
        $this->user->setRoles(['ROLE_USER']);
        $roles = $this->user->getRoles();
        $this->assertCount(1, $roles);
    }

    public function testPasswordGetterAndSetter(): void
    {
        $this->user->setPassword('hashed_password');
        $this->assertSame('hashed_password', $this->user->getPassword());
    }

    public function testLastnameGetterAndSetter(): void
    {
        $this->user->setLastname('Dupont');
        $this->assertSame('Dupont', $this->user->getLastname());
    }

    public function testFirstnameGetterAndSetter(): void
    {
        $this->user->setFirstname('Jean');
        $this->assertSame('Jean', $this->user->getFirstname());
    }

    public function testDobGetterAndSetter(): void
    {
        $date = new \DateTime('1990-01-15');
        $this->user->setDob($date);
        $this->assertSame($date, $this->user->getDob());
    }

    public function testPhotoGetterAndSetter(): void
    {
        $this->assertNull($this->user->getPhoto());
        $this->user->setPhoto('photo.jpg');
        $this->assertSame('photo.jpg', $this->user->getPhoto());
        $this->user->setPhoto(null);
        $this->assertNull($this->user->getPhoto());
    }

    public function testFavoriteColorGetterAndSetter(): void
    {
        $this->user->setFavoriteColor('#FF5733');
        $this->assertSame('#FF5733', $this->user->getFavoriteColor());
    }

    public function testPhoneGetterAndSetter(): void
    {
        $this->user->setPhone('0612345678');
        $this->assertSame('0612345678', $this->user->getPhone());
    }

    public function testIsVerifiedDefaultFalse(): void
    {
        $this->assertFalse($this->user->isVerified());
    }

    public function testIsVerifiedSetter(): void
    {
        $this->user->setIsVerified(true);
        $this->assertTrue($this->user->isVerified());
    }

    public function testPlanGetterAndSetter(): void
    {
        $plan = new Plan();
        $this->user->setPlan($plan);
        $this->assertSame($plan, $this->user->getPlan());
        $this->user->setPlan(null);
        $this->assertNull($this->user->getPlan());
    }

    public function testAddGeneration(): void
    {
        $generation = new Generation();
        $this->user->addGeneration($generation);
        $this->assertCount(1, $this->user->getGenerations());
        $this->assertTrue($this->user->getGenerations()->contains($generation));
        $this->assertSame($this->user, $generation->getUser());
    }

    public function testAddGenerationNoDuplicates(): void
    {
        $generation = new Generation();
        $this->user->addGeneration($generation);
        $this->user->addGeneration($generation);
        $this->assertCount(1, $this->user->getGenerations());
    }

    public function testRemoveGeneration(): void
    {
        $generation = new Generation();
        $this->user->addGeneration($generation);
        $this->user->removeGeneration($generation);
        $this->assertCount(0, $this->user->getGenerations());
        $this->assertNull($generation->getUser());
    }

    public function testAddUserContact(): void
    {
        $contact = new UserContact();
        $this->user->addUserContact($contact);
        $this->assertCount(1, $this->user->getUserContacts());
        $this->assertTrue($this->user->getUserContacts()->contains($contact));
        $this->assertSame($this->user, $contact->getUser());
    }

    public function testAddUserContactNoDuplicates(): void
    {
        $contact = new UserContact();
        $this->user->addUserContact($contact);
        $this->user->addUserContact($contact);
        $this->assertCount(1, $this->user->getUserContacts());
    }

    public function testRemoveUserContact(): void
    {
        $contact = new UserContact();
        $this->user->addUserContact($contact);
        $this->user->removeUserContact($contact);
        $this->assertCount(0, $this->user->getUserContacts());
        $this->assertNull($contact->getUser());
    }
}
