<?php

namespace App\Controller;

use App\Repository\GenerationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('IS_AUTHENTICATED_FULLY')]
class AccountController extends AbstractController
{
    private const TOOL_MAP = [
        'url-to-pdf'         => ['label' => 'URL en PDF',          'icon' => 'fa-link',             'route' => 'app_convert_url'],
        'html-to-pdf'        => ['label' => 'HTML en PDF',         'icon' => 'fa-code',             'route' => 'app_convert_html'],
        'merge-pdf'          => ['label' => 'Fusionner des PDF',   'icon' => 'fa-object-group',     'route' => 'app_convert_merge'],
        'office-to-pdf'      => ['label' => 'Office en PDF',       'icon' => 'fa-file-word',        'route' => 'app_convert_office'],
        'word-to-pdf'        => ['label' => 'Word en PDF',         'icon' => 'fa-file-word',        'route' => 'app_convert_office'],
        'excel-to-pdf'       => ['label' => 'Excel en PDF',        'icon' => 'fa-file-excel',       'route' => 'app_convert_office'],
        'powerpoint-to-pdf'  => ['label' => 'PowerPoint en PDF',   'icon' => 'fa-file-powerpoint',  'route' => 'app_convert_office'],
        'markdown-to-pdf'    => ['label' => 'Markdown en PDF',     'icon' => 'fa-file-code',        'route' => 'app_convert_markdown'],
        'screenshot'         => ['label' => "Capture d'écran",     'icon' => 'fa-camera',           'route' => 'app_convert_screenshot'],
        'wysiwyg-to-pdf'     => ['label' => 'Éditeur WYSIWYG',     'icon' => 'fa-pen-to-square',    'route' => 'app_convert_wysiwyg'],
        'image-to-pdf'       => ['label' => 'Image en PDF',        'icon' => 'fa-image',            'route' => 'app_tool_image_to_pdf'],
        'split-pdf'          => ['label' => 'Diviser un PDF',      'icon' => 'fa-scissors',         'route' => 'app_tool_split_pdf'],
    ];

    #[Route('/account/history', name: 'app_account_history', methods: ['GET'])]
    public function history(GenerationRepository $generationRepository): Response
    {
        $user = $this->getUser();
        $generations = $generationRepository->findByUserOrderedByDate($user);

        $items = [];
        foreach ($generations as $generation) {
            $tool = $generation->getFile();
            $meta = self::TOOL_MAP[$tool] ?? ['label' => $tool, 'icon' => 'fa-file-pdf', 'route' => null];

            $items[] = [
                'id'        => $generation->getId(),
                'tool'      => $tool,
                'toolLabel' => $meta['label'],
                'toolIcon'  => $meta['icon'],
                'toolUrl'   => $meta['route'] ? $this->generateUrl($meta['route']) : null,
                'createdAt' => $generation->getCreatedAt()->format('d/m/Y à H\hi'),
            ];
        }

        return $this->render('account/history.html.twig', [
            'generations' => $items,
        ]);
    }
}
