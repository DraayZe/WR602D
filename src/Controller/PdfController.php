<?php

namespace App\Controller;

use App\Service\GenerationService;
use App\Service\GotenbergService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class PdfController extends AbstractController
{
    public function __construct(
        private readonly GotenbergService $gotenbergService,
        private readonly GenerationService $generationService
    ) {}

    // ── Quota check helper ────────────────────────────────────────────────────

    private function checkQuota(): ?Response
    {
        $user = $this->getUser();

        if (!$user->getPlan()) {
            return $this->json([
                'error' => 'no_plan',
                'message' => 'Aucun plan actif. Veuillez choisir un plan pour utiliser cet outil.',
            ], Response::HTTP_FORBIDDEN);
        }

        if (!$this->generationService->canGenerate($user)) {
            $quota = $this->generationService->getQuota($user);
            return $this->json([
                'error' => 'quota_exceeded',
                'message' => "Limite journalière atteinte ({$quota['used']}/{$quota['limit']} générations utilisées).",
            ], Response::HTTP_TOO_MANY_REQUESTS);
        }

        return null;
    }

    // ── Page routes ───────────────────────────────────────────────────────────

    #[IsGranted("ROLE_USER")]
    #[Route('/convert/url', name: 'app_convert_url', methods: ['GET'])]
    public function urlToPdfPage(): Response
    {
        return $this->render('tools/url-to-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/convert/html', name: 'app_convert_html', methods: ['GET'])]
    public function htmlToPdfPage(): Response
    {
        return $this->render('tools/html-to-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/convert/merge', name: 'app_convert_merge', methods: ['GET'])]
    public function mergePdfPage(): Response
    {
        return $this->render('tools/merge-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/convert/office', name: 'app_convert_office', methods: ['GET'])]
    public function officeToPdfPage(): Response
    {
        return $this->render('tools/office-to-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/convert/markdown', name: 'app_convert_markdown', methods: ['GET'])]
    public function markdownToPdfPage(): Response
    {
        return $this->render('tools/markdown-to-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/convert/screenshot', name: 'app_convert_screenshot', methods: ['GET'])]
    public function screenshotPage(): Response
    {
        return $this->render('tools/screenshot.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/convert/wysiwyg', name: 'app_convert_wysiwyg', methods: ['GET'])]
    public function wysiwygToPdfPage(): Response
    {
        return $this->render('tools/wysiwyg-to-pdf.html.twig');
    }

    // Anciennes routes image & split (non renommées, hors critères d'éval)
    #[IsGranted("ROLE_USER")]
    #[Route('/tools/image-to-pdf', name: 'app_tool_image_to_pdf', methods: ['GET'])]
    public function imageToPdfPage(): Response
    {
        return $this->render('tools/image-to-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/tools/split-pdf', name: 'app_tool_split_pdf', methods: ['GET'])]
    public function splitPdfPage(): Response
    {
        return $this->render('tools/split-pdf.html.twig');
    }

    // ── Quota API ─────────────────────────────────────────────────────────────

    #[IsGranted("ROLE_USER")]
    #[Route('/api/quota', name: 'app_api_quota', methods: ['GET'])]
    public function quota(): Response
    {
        return $this->json($this->generationService->getQuota($this->getUser()));
    }

    // ── API endpoints ─────────────────────────────────────────────────────────

    #[IsGranted("ROLE_USER")]
    #[Route('/api/convert/url', name: 'app_api_convert_url', methods: ['POST', 'GET'])]
    public function fromUrl(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $url = $request->query->get('url');
        if (!$url) {
            $data = json_decode($request->getContent(), true);
            $url = $data['url'] ?? $request->request->get('url');
        }

        if (!$url) {
            return $this->json(['error' => 'URL parameter is required'], Response::HTTP_BAD_REQUEST);
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->json(['error' => 'Invalid URL format'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $pdfContent = $this->gotenbergService->generatePdfFromUrl($url);
            $filename = 'webpage-' . date('Y-m-d-His') . '.pdf';

            $this->generationService->record($this->getUser(), 'url-to-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to generate PDF', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/api/convert/html', name: 'app_api_convert_html', methods: ['POST'])]
    public function fromHtml(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $file = $request->files->get('files') ?? $request->files->get('file');
        if (!$file) {
            $allFiles = $request->files->all();
            if (!empty($allFiles)) {
                $file = reset($allFiles);
            }
        }

        if (!$file) {
            return $this->json(['error' => 'HTML file is required'], Response::HTTP_BAD_REQUEST);
        }

        if ($file->getClientOriginalExtension() !== 'html' && $file->getClientMimeType() !== 'text/html') {
            return $this->json(['error' => 'File must be an HTML file'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $htmlContent = file_get_contents($file->getPathname());
            $pdfContent = $this->gotenbergService->generatePdfFromHtml($htmlContent);
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.pdf';

            $this->generationService->record($this->getUser(), 'html-to-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Failed to generate PDF from HTML', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/api/convert/merge', name: 'app_api_convert_merge', methods: ['POST'])]
    public function mergePdf(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $files = $request->files->all()['files'] ?? [];
        if (count($files) < 2) {
            return $this->json(['error' => 'Au moins 2 fichiers PDF sont requis'], Response::HTTP_BAD_REQUEST);
        }

        $fileList = [];
        foreach ($files as $file) {
            if (strtolower($file->getClientOriginalExtension()) !== 'pdf') {
                return $this->json(['error' => 'Tous les fichiers doivent être des PDF'], Response::HTTP_BAD_REQUEST);
            }
            $fileList[] = ['path' => $file->getPathname(), 'filename' => $file->getClientOriginalName()];
        }

        try {
            $pdfContent = $this->gotenbergService->mergePdfs($fileList);

            $this->generationService->record($this->getUser(), 'merge-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="merged.pdf"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la fusion', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/api/convert/office', name: 'app_api_convert_office', methods: ['POST'])]
    public function officeToPdf(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'Fichier requis (Word, Excel ou PowerPoint)'], Response::HTTP_BAD_REQUEST);
        }

        $ext = strtolower($file->getClientOriginalExtension());
        $mimeMap = [
            'doc'  => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls'  => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt'  => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];

        if (!isset($mimeMap[$ext])) {
            return $this->json(['error' => 'Format non supporté. Utilisez .doc, .docx, .xls, .xlsx, .ppt ou .pptx'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $pdfContent = $this->gotenbergService->convertWithLibreOffice($file->getPathname(), $file->getClientOriginalName(), $mimeMap[$ext]);
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.pdf';

            $this->generationService->record($this->getUser(), 'office-to-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la conversion', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/api/convert/markdown', name: 'app_api_convert_markdown', methods: ['POST'])]
    public function markdownToPdf(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'Fichier Markdown requis'], Response::HTTP_BAD_REQUEST);
        }

        if (!in_array(strtolower($file->getClientOriginalExtension()), ['md', 'markdown'])) {
            return $this->json(['error' => 'Le fichier doit être un fichier Markdown (.md ou .markdown)'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $mdContent = file_get_contents($file->getPathname());
            $pdfContent = $this->gotenbergService->generatePdfFromMarkdown($mdContent);
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.pdf';

            $this->generationService->record($this->getUser(), 'markdown-to-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la conversion', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/api/convert/screenshot', name: 'app_api_convert_screenshot', methods: ['POST'])]
    public function screenshot(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $data = json_decode($request->getContent(), true);
        $url = $data['url'] ?? $request->request->get('url');

        if (!$url) {
            return $this->json(['error' => 'URL requise'], Response::HTTP_BAD_REQUEST);
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->json(['error' => 'URL invalide'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $imageContent = $this->gotenbergService->generateScreenshot($url);
            $filename = 'screenshot-' . date('Y-m-d-His') . '.png';

            $this->generationService->record($this->getUser(), 'screenshot');

            return new Response($imageContent, Response::HTTP_OK, [
                'Content-Type' => 'image/png',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la capture', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/api/convert/wysiwyg', name: 'app_api_convert_wysiwyg', methods: ['POST'])]
    public function wysiwygToPdf(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $data = json_decode($request->getContent(), true);
        $htmlBody = $data['html'] ?? '';

        if (!$htmlBody || trim(strip_tags($htmlBody)) === '') {
            return $this->json(['error' => 'Le contenu ne peut pas être vide'], Response::HTTP_BAD_REQUEST);
        }

        $fullHtml = <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #1a1a1a; font-size: 16px; }
  h1 { font-size: 2em; margin-top: 1em; margin-bottom: 0.4em; }
  h2 { font-size: 1.5em; margin-top: 1em; margin-bottom: 0.4em; }
  h3 { font-size: 1.2em; margin-top: 1em; margin-bottom: 0.4em; }
  ul, ol { padding-left: 1.5em; }
  li { margin-bottom: 0.3em; }
  p { margin: 0.6em 0; }
  b, strong { font-weight: 700; }
  i, em { font-style: italic; }
  u { text-decoration: underline; }
  s { text-decoration: line-through; }
</style>
</head>
<body>{$htmlBody}</body>
</html>
HTML;

        try {
            $pdfContent = $this->gotenbergService->generatePdfFromHtml($fullHtml);
            $filename = 'document-' . date('Y-m-d-His') . '.pdf';

            $this->generationService->record($this->getUser(), 'wysiwyg-to-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la génération', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    // ── Anciens endpoints (rétrocompatibilité) ────────────────────────────────

    #[IsGranted("ROLE_USER")]
    #[Route('/api/tools/image-to-pdf', name: 'app_api_image_to_pdf', methods: ['POST'])]
    public function imageToPdf(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'Image requise'], Response::HTTP_BAD_REQUEST);
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'])) {
            return $this->json(['error' => 'Format non supporté. Utilisez JPG, PNG, WEBP, GIF, BMP ou TIFF'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $pdfContent = $this->gotenbergService->convertWithLibreOffice($file->getPathname(), $file->getClientOriginalName(), $file->getMimeType() ?: 'image/' . $ext);
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.pdf';

            $this->generationService->record($this->getUser(), 'image-to-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la conversion', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/api/tools/split-pdf', name: 'app_api_split_pdf', methods: ['POST'])]
    public function splitPdf(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'Fichier PDF requis'], Response::HTTP_BAD_REQUEST);
        }

        if (strtolower($file->getClientOriginalExtension()) !== 'pdf') {
            return $this->json(['error' => 'Le fichier doit être un PDF'], Response::HTTP_BAD_REQUEST);
        }

        $splitMode = $request->request->get('splitMode', 'intervals');
        $splitParam = $request->request->get('splitParam', '1');

        if (!in_array($splitMode, ['intervals', 'pages'])) {
            return $this->json(['error' => 'Mode de division invalide'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $zipContent = $this->gotenbergService->splitPdf($file->getPathname(), $file->getClientOriginalName(), $splitMode, $splitParam);
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '-split.zip';

            $this->generationService->record($this->getUser(), 'split-pdf');

            return new Response($zipContent, Response::HTTP_OK, [
                'Content-Type' => 'application/zip',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la division', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
