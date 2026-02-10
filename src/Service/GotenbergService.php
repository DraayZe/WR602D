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

    private function createTempFile(string $content): string
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'gotenberg_') . '.html';
        file_put_contents($tempFile, $content);
        return $tempFile;
    }
}
