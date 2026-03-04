<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\ProfileFormType;
use App\Form\ProfilePasswordFormType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('IS_AUTHENTICATED_FULLY')]
class ProfileController extends AbstractController
{
    #[Route('/profile', name: 'app_profile', methods: ['GET', 'POST'])]
    public function index(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        $profileForm = $this->createForm(ProfileFormType::class, $user);
        $passwordForm = $this->createForm(ProfilePasswordFormType::class);

        $errors = [];
        $success = false;

        if ($request->isMethod('POST')) {
            $csrfToken = $request->request->get('_csrf_token', '');

            if (!$this->isCsrfTokenValid('profile_form', $csrfToken)) {
                $errors['csrf'] = 'Token CSRF invalide.';
            } else {
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
                    } else {
                        foreach ($profileForm->getErrors(true) as $error) {
                            $field = $error->getOrigin()->getName();
                            $errors[$field] = $errors[$field] ?? $error->getMessage();
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
                    } else {
                        foreach ($passwordForm->getErrors(true) as $error) {
                            $field = $error->getOrigin()->getName();
                            $errors[$field] = $errors[$field] ?? $error->getMessage();
                        }
                    }
                }
            }
        }

        return $this->render('profile/index.html.twig', [
            'errors' => $errors,
            'success' => $success,
            'user' => [
                'lastname' => $user->getLastname(),
                'firstname' => $user->getFirstname(),
                'email' => $user->getEmail(),
                'dob' => $user->getDob()?->format('Y-m-d'),
                'phone' => $user->getPhone(),
                'favoriteColor' => $user->getFavoriteColor(),
                'photo' => $user->getPhoto(),
            ],
        ]);
    }
}
