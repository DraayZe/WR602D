<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use App\Repository\PlanRepository;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

class RegistrationController extends AbstractController
{
    public function __construct(private EmailVerifier $emailVerifier)
    {
    }

    #[Route('/register', name: 'app_register')]
    public function register(Request $request, UserPasswordHasherInterface $userPasswordHasher, Security $security, EntityManagerInterface $entityManager, PlanRepository $planRepository): Response
    {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && !$this->isCsrfTokenValid('register_form', $request->request->all('registration_form')['_token'] ?? '')) {
            $form->addError(new \Symfony\Component\Form\FormError('Le token CSRF est invalide.'));
        }

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var string $plainPassword */
            $plainPassword = $form->get('plainPassword')->getData();
            $user->setPassword($userPasswordHasher->hashPassword($user, $plainPassword));

            // Assigner le plan choisi
            $planId = $request->request->all()['registration_form']['plan'] ?? null;
            if ($planId) {
                $plan = $planRepository->find((int) $planId);
                if ($plan && $plan->isActive()) {
                    $user->setPlan($plan);
                }
            }
            // Fallback : plan FREE si aucun plan valide sélectionné
            if (!$user->getPlan()) {
                $freePlan = $planRepository->findOneBy(['name' => 'FREE', 'active' => true]);
                if ($freePlan) {
                    $user->setPlan($freePlan);
                }
            }

            $entityManager->persist($user);
            $entityManager->flush();

            $this->emailVerifier->sendEmailConfirmation('app_verify_email', $user,
                (new TemplatedEmail())
                    ->from(new Address('noreply@larrypdf.com', 'Lenny'))
                    ->to((string) $user->getEmail())
                    ->subject('Please Confirm your Email')
                    ->htmlTemplate('registration/confirmation_email.html.twig')
            );

            return $security->login($user, 'form_login', 'main');
        }

        $errors = [];
        foreach ($form->getErrors(true) as $error) {
            $field = $error->getOrigin()->getName();
            $errors[$field] = $errors[$field] ?? $error->getMessage();
        }

        // Charger les plans actifs pour les props React
        $plans = array_map(fn($p) => [
            'id' => $p->getId(),
            'name' => $p->getName(),
            'price' => (float) $p->getPrice(),
            'description' => $p->getDescription(),
            'limitGeneration' => $p->getLimitGeneration(),
        ], $planRepository->findBy(['active' => true]));

        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form,
            'errors' => $errors,
            'plans' => $plans,
            'lastValues' => [
                'lastname' => $form->get('lastname')->getData(),
                'firstname' => $form->get('firstname')->getData(),
                'email' => $form->get('email')->getData(),
                'dob' => $form->get('dob')->getData()?->format('Y-m-d'),
                'phone' => $form->get('phone')->getData(),
                'favoriteColor' => $form->get('favoriteColor')->getData(),
            ],
        ]);
    }

    #[Route('/verify/email', name: 'app_verify_email')]
    public function verifyUserEmail(Request $request, TranslatorInterface $translator): Response
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        try {
            /** @var User $user */
            $user = $this->getUser();
            $this->emailVerifier->handleEmailConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $exception) {
            $this->addFlash('verify_email_error', $translator->trans($exception->getReason(), [], 'VerifyEmailBundle'));
            return $this->redirectToRoute('app_home');
        }

        $this->addFlash('success', 'Your email address has been verified.');
        return $this->redirectToRoute('app_home');
    }
}
