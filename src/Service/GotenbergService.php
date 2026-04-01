<?php

namespace App\Service;

use Symfony\Component\Mime\Part\DataPart;
use Symfony\Component\Mime\Part\Multipart\FormDataPart;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class GotenbergService
{
    private string $gotenbergUrl;
    private HttpClientInterface $httpClient;

    public function __construct(
        string $gotenbergUrl,
        HttpClientInterface $httpClient
    ) {
        $this->gotenbergUrl = $gotenbergUrl;
        $this->httpClient = $httpClient;
    }

    public function generatePdfFromHtml(string $htmlContent): string
    {
        $tempFile = $this->createTempFile($htmlContent);

        try {
            $formData = new FormDataPart([
                'files' => DataPart::fromPath(
                    $tempFile,
                    'index.html',
                    'text/html'
                ),
            ]);

            $headers = $formData->getPreparedHeaders()->toArray();

            $response = $this->httpClient->request('POST', $this->gotenbergUrl . '/forms/chromium/convert/html', [
                'headers' => $headers,
                'body' => $formData->bodyToIterable(),
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new \RuntimeException('Failed to generate PDF: ' . $response->getContent(false));
            }

            return $response->getContent();
        } finally {
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
        }
    }

    public function generatePdfFromUrl(string $url, array $options = []): string
    {
        $formFields = array_merge(['url' => $url], $options);

        $formData = new FormDataPart($formFields);
        $headers = $formData->getPreparedHeaders()->toArray();

        $response = $this->httpClient->request('POST', $this->gotenbergUrl . '/forms/chromium/convert/url', [
            'headers' => $headers,
            'body' => $formData->bodyToIterable(),
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException('Failed to generate PDF from URL: ' . $response->getContent(false));
        }

        return $response->getContent();
    }

    public function mergePdfs(array $files): string
    {
        $boundary = bin2hex(random_bytes(16));
        $body = '';

        foreach ($files as $file) {
            $content = file_get_contents($file['path']);
            $body .= "--{$boundary}\r\n";
            $body .= "Content-Disposition: form-data; name=\"files\"; filename=\"{$file['filename']}\"\r\n";
            $body .= "Content-Type: application/pdf\r\n\r\n";
            $body .= $content . "\r\n";
        }
        $body .= "--{$boundary}--\r\n";

        $response = $this->httpClient->request('POST', $this->gotenbergUrl . '/forms/pdfengines/merge', [
            'headers' => ['Content-Type' => 'multipart/form-data; boundary=' . $boundary],
            'body' => $body,
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException('Failed to merge PDFs: ' . $response->getContent(false));
        }

        return $response->getContent();
    }

    public function convertWithLibreOffice(string $filePath, string $filename, string $mimeType): string
    {
        $formData = new FormDataPart([
            'files' => DataPart::fromPath($filePath, $filename, $mimeType),
        ]);

        $headers = $formData->getPreparedHeaders()->toArray();

        $response = $this->httpClient->request('POST', $this->gotenbergUrl . '/forms/libreoffice/convert', [
            'headers' => $headers,
            'body' => $formData->bodyToIterable(),
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException('Failed to convert document: ' . $response->getContent(false));
        }

        return $response->getContent();
    }

    public function splitPdf(string $filePath, string $filename, string $splitMode, string $splitParam): string
    {
        $boundary = bin2hex(random_bytes(16));
        $content = file_get_contents($filePath);

        $body = "--{$boundary}\r\n";
        $body .= "Content-Disposition: form-data; name=\"files\"; filename=\"{$filename}\"\r\n";
        $body .= "Content-Type: application/pdf\r\n\r\n";
        $body .= $content . "\r\n";
        $body .= "--{$boundary}\r\n";
        $body .= "Content-Disposition: form-data; name=\"splitMode\"\r\n\r\n";
        $body .= $splitMode . "\r\n";

        if ($splitMode === 'intervals') {
            $body .= "--{$boundary}\r\n";
            $body .= "Content-Disposition: form-data; name=\"splitSpan\"\r\n\r\n";
            $body .= $splitParam . "\r\n";
        } else {
            $body .= "--{$boundary}\r\n";
            $body .= "Content-Disposition: form-data; name=\"splitCriteria\"\r\n\r\n";
            $body .= $splitParam . "\r\n";
        }

        $body .= "--{$boundary}--\r\n";

        $response = $this->httpClient->request('POST', $this->gotenbergUrl . '/forms/pdfengines/split', [
            'headers' => ['Content-Type' => 'multipart/form-data; boundary=' . $boundary],
            'body' => $body,
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException('Failed to split PDF: ' . $response->getContent(false));
        }

        return $response->getContent();
    }

    private function createTempFile(string $content): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'gotenberg_') . '.html';
        file_put_contents($tempFile, $content);
        return $tempFile;
    }
}
