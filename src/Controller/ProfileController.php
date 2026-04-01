<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\ProfileFormType;
use App\Form\ProfilePasswordFormType;
use App\Repository\PlanRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('IS_AUTHENTICATED_FULLY')]
class ProfileController extends AbstractController
{
    #[Route('/profile', name: 'app_profile', methods: ['GET'])]
    public function index(): Response
    {
        return $this->redirectToRoute('app_home');
    }

    #[Route('/profile', name: 'app_profile_update', methods: ['POST'])]
    public function update(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): Response
    {
        /** @var User $user */
        $user = $this->getUser();
        $isXhr = $request->isXmlHttpRequest();

        $profileForm = $this->createForm(ProfileFormType::class, $user);
        $passwordForm = $this->createForm(ProfilePasswordFormType::class);

        $errors = [];
        $success = false;

        $csrfToken = $request->request->get('_csrf_token', '');

        if (!$this->isCsrfTokenValid('profile_form', $csrfToken)) {
            if ($isXhr) {
                return new JsonResponse(['success' => false, 'errors' => ['csrf' => 'Token CSRF invalide.']]);
            }
            return $this->redirectToRoute('app_home');
        }

        $profileForm->handleRequest($request);
        $passwordForm->handleRequest($request);

        if ($profileForm->isSubmitted()) {
            if ($profileForm->isValid()) {
                $photoFile = $request->files->get('photo');
                if ($photoFile) {
                    $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads/avatars';
                    if (!is_dir($uploadsDir)) {
                        mkdir($uploadsDir, 0755, true);
                    }
                    $filename = uniqid() . '.' . $photoFile->guessExtension();
                    $photoFile->move($uploadsDir, $filename);
                    $user->setPhoto($filename);
                }
                $entityManager->flush();
                $success = true;

                if ($isXhr) {
                    return new JsonResponse([
                        'success' => true,
                        'photo' => $user->getPhoto(),
                        'firstname' => $user->getFirstname(),
                        'lastname' => $user->getLastname(),
                    ]);
                }
            } else {
                foreach ($profileForm->getErrors(true) as $error) {
                    $field = $error->getOrigin()->getName();
                    $errors[$field] = $errors[$field] ?? $error->getMessage();
                }
                if ($isXhr) {
                    return new JsonResponse(['success' => false, 'errors' => $errors]);
                }
            }
        } elseif ($passwordForm->isSubmitted()) {
            if ($passwordForm->isValid()) {
                $currentPassword = $passwordForm->get('currentPassword')->getData();
                if (!$passwordHasher->isPasswordValid($user, $currentPassword)) {
                    $errors['currentPassword'] = 'Mot de passe actuel incorrect.';
                } else {
                    $newPassword = $passwordForm->get('newPassword')->getData();
                    $confirmPassword = $passwordForm->get('confirmPassword')->getData();
                    if ($newPassword !== $confirmPassword) {
                        $errors['confirmPassword'] = 'Les mots de passe ne correspondent pas.';
                    } else {
                        $user->setPassword($passwordHasher->hashPassword($user, $newPassword));
                        $entityManager->flush();
                        $success = true;
                    }
                }
                if ($isXhr) {
                    return new JsonResponse($success
                        ? ['success' => true]
                        : ['success' => false, 'errors' => $errors]
                    );
                }
            } else {
                foreach ($passwordForm->getErrors(true) as $error) {
                    $field = $error->getOrigin()->getName();
                    $errors[$field] = $errors[$field] ?? $error->getMessage();
                }
                if ($isXhr) {
                    return new JsonResponse(['success' => false, 'errors' => $errors]);
                }
            }
        }

        return $this->redirectToRoute('app_home');
    }

    #[Route('/profile/plan', name: 'app_profile_plan', methods: ['POST'])]
    public function changePlan(Request $request, EntityManagerInterface $entityManager, PlanRepository $planRepository): Response
    {
        $isXhr = $request->isXmlHttpRequest();

        if (!$this->isCsrfTokenValid('profile_plan_form', $request->request->get('_csrf_token', ''))) {
            if ($isXhr) {
                return new JsonResponse(['success' => false, 'error' => 'Token CSRF invalide.']);
            }
            return $this->redirectToRoute('app_home');
        }

        $planId = (int) $request->request->get('plan_id');
        $plan = $planRepository->find($planId);

        if (!$plan || !$plan->isActive()) {
            if ($isXhr) {
                return new JsonResponse(['success' => false, 'error' => 'Plan invalide.']);
            }
            return $this->redirectToRoute('app_home');
        }

        /** @var User $user */
        $user = $this->getUser();
        $user->setPlan($plan);
        $entityManager->flush();

        if ($isXhr) {
            return new JsonResponse([
                'success' => true,
                'plan' => ['id' => $plan->getId(), 'name' => $plan->getName()],
            ]);
        }

        return $this->redirectToRoute('app_home');
    }
}
