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

    #[Route('/pdf/generate', name: 'app_pdf_generate', methods: ['GET'])]
    public function generate(): Response
    {
        $htmlContent = $this->renderView('pdf/index.html.twig', [
            'controller_name' => 'PdfController',
            'date' => new \DateTime(),
        ]);

        $pdfContent = $this->gotenbergService->generatePdfFromHtml($htmlContent);

        return new Response($pdfContent, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="document.pdf"',
        ]);
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/tools/url-to-pdf', name: 'app_tool_url_to_pdf', methods: ['GET'])]
    public function urlToPdfPage(): Response
    {
        return $this->render('tools/url-to-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/tools/html-to-pdf', name: 'app_tool_html_to_pdf', methods: ['GET'])]
    public function htmlToPdfPage(): Response
    {
        return $this->render('tools/html-to-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/tools/merge-pdf', name: 'app_tool_merge_pdf', methods: ['GET'])]
    public function mergePdfPage(): Response
    {
        return $this->render('tools/merge-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/tools/word-to-pdf', name: 'app_tool_word_to_pdf', methods: ['GET'])]
    public function wordToPdfPage(): Response
    {
        return $this->render('tools/word-to-pdf.html.twig');
    }

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

    #[IsGranted("ROLE_USER")]
    #[Route('/tools/excel-to-pdf', name: 'app_tool_excel_to_pdf', methods: ['GET'])]
    public function excelToPdfPage(): Response
    {
        return $this->render('tools/excel-to-pdf.html.twig');
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/tools/powerpoint-to-pdf', name: 'app_tool_powerpoint_to_pdf', methods: ['GET'])]
    public function powerpointToPdfPage(): Response
    {
        return $this->render('tools/powerpoint-to-pdf.html.twig');
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
    #[Route('/forms/chromium/convert/url', name: 'app_pdf_from_url', methods: ['POST', 'GET'])]
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
    #[Route('/forms/chromium/convert/html', name: 'app_pdf_from_html', methods: ['POST'])]
    public function fromHtml(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $file = $request->files->get('files');
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
    #[Route('/api/tools/merge-pdf', name: 'app_api_merge_pdf', methods: ['POST'])]
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
    #[Route('/api/tools/word-to-pdf', name: 'app_api_word_to_pdf', methods: ['POST'])]
    public function wordToPdf(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'Fichier Word requis'], Response::HTTP_BAD_REQUEST);
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['doc', 'docx'])) {
            return $this->json(['error' => 'Le fichier doit être un document Word (.doc ou .docx)'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $mimeType = $ext === 'docx'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : 'application/msword';

            $pdfContent = $this->gotenbergService->convertWithLibreOffice($file->getPathname(), $file->getClientOriginalName(), $mimeType);
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.pdf';

            $this->generationService->record($this->getUser(), 'word-to-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la conversion', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

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

    #[IsGranted("ROLE_USER")]
    #[Route('/api/tools/excel-to-pdf', name: 'app_api_excel_to_pdf', methods: ['POST'])]
    public function excelToPdf(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'Fichier Excel requis'], Response::HTTP_BAD_REQUEST);
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['xls', 'xlsx'])) {
            return $this->json(['error' => 'Le fichier doit être un classeur Excel (.xls ou .xlsx)'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $mimeType = $ext === 'xlsx'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/vnd.ms-excel';

            $pdfContent = $this->gotenbergService->convertWithLibreOffice($file->getPathname(), $file->getClientOriginalName(), $mimeType);
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.pdf';

            $this->generationService->record($this->getUser(), 'excel-to-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la conversion', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/api/tools/powerpoint-to-pdf', name: 'app_api_powerpoint_to_pdf', methods: ['POST'])]
    public function powerpointToPdf(Request $request): Response
    {
        if ($block = $this->checkQuota()) return $block;

        $file = $request->files->get('file');
        if (!$file) {
            return $this->json(['error' => 'Fichier PowerPoint requis'], Response::HTTP_BAD_REQUEST);
        }

        $ext = strtolower($file->getClientOriginalExtension());
        if (!in_array($ext, ['ppt', 'pptx'])) {
            return $this->json(['error' => 'Le fichier doit être une présentation PowerPoint (.ppt ou .pptx)'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $mimeType = $ext === 'pptx'
                ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                : 'application/vnd.ms-powerpoint';

            $pdfContent = $this->gotenbergService->convertWithLibreOffice($file->getPathname(), $file->getClientOriginalName(), $mimeType);
            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.pdf';

            $this->generationService->record($this->getUser(), 'powerpoint-to-pdf');

            return new Response($pdfContent, Response::HTTP_OK, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $filename . '"',
            ]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la conversion', 'message' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
