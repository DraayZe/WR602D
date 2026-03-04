<?php

namespace App\Controller;

use App\Service\GotenbergService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class PdfController extends AbstractController
{
    public function __construct(
        private readonly GotenbergService $gotenbergService
    ) {
    }

    #[Route('/pdf/generate', name: 'app_pdf_generate', methods: ['GET'])]
    public function generate(): Response
    {
        $htmlContent = $this->renderView('pdf/index.html.twig', [
            'controller_name' => 'PdfController',
            'date' => new \DateTime(),
        ]);

        $pdfContent = $this->gotenbergService->generatePdfFromHtml($htmlContent);

        return new Response(
            $pdfContent,
            Response::HTTP_OK,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="document.pdf"',
            ]
        );
    }

    #[IsGranted("ROLE_USER")]
    #[Route('/tools/url-to-pdf', name: 'app_tool_url_to_pdf', methods: ['GET'])]
    public function urlToPdfPage(): Response
    {
        return $this->render('tools/url-to-pdf.html.twig');
    }

    #[Route('/tools/html-to-pdf', name: 'app_tool_html_to_pdf', methods: ['GET'])]
    public function htmlToPdfPage() : Response
    {
        return $this->render('tools/html-to-pdf.html.twig');
    }

    #[Route('/forms/chromium/convert/url', name: 'app_pdf_from_url', methods: ['POST', 'GET'])]
    public function fromUrl(Request $request): Response
    {
        $url = $request->query->get('url');

        if (!$url) {
            $data = json_decode($request->getContent(), true);
            $url = $data['url'] ?? $request->request->get('url');
        }

        if (!$url) {
            return $this->json([
                'error' => 'URL parameter is required',
                'usage' => [
                    'query_param' => 'POST /pdf/from-url?url=https://example.com',
                    'json_body' => 'POST /pdf/from-url with {"url": "https://example.com"}'
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->json([
                'error' => 'Invalid URL format'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $pdfContent = $this->gotenbergService->generatePdfFromUrl($url);

            $filename = 'webpage-' . date('Y-m-d-His') . '.pdf';

            return new Response(
                $pdfContent,
                Response::HTTP_OK,
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="' . $filename . '"',
                ]
            );
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to generate PDF',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/forms/chromium/convert/html', name: 'app_pdf_from_html', methods: ['POST'])]
    public function fromHtml(Request $request): Response
    {
        $file = $request->files->get('files');

        if (!$file) {
            $allFiles = $request->files->all();
            if (!empty($allFiles)) {
                $file = reset($allFiles);
            }
        }

        if (!$file) {
            return $this->json([
                'error' => 'HTML file is required',
                'usage' => 'POST /forms/chromium/convert/html with multipart/form-data field "files" containing an HTML file',
                'debug' => [
                    'received_files' => array_keys($request->files->all()),
                    'content_type' => $request->headers->get('Content-Type'),
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        if ($file->getClientOriginalExtension() !== 'html' && $file->getClientMimeType() !== 'text/html') {
            return $this->json([
                'error' => 'File must be an HTML file',
                'received_type' => $file->getClientMimeType()
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $htmlContent = file_get_contents($file->getPathname());

            if ($htmlContent === false) {
                throw new \RuntimeException('Unable to read HTML file content');
            }

            $pdfContent = $this->gotenbergService->generatePdfFromHtml($htmlContent);

            $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.pdf';

            return new Response(
                $pdfContent,
                Response::HTTP_OK,
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="' . $filename . '"',
                ]
            );
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Failed to generate PDF from HTML',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
