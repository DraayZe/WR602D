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

    public function generatePdfFromMarkdown(string $markdownContent): string
    {
        $htmlWrapper = <<<'HTML'
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #1a1a1a; }
  h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
  h1 { font-size: 2em; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2em; }
  code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
  pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #555; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; }
  th { background: #f4f4f4; }
  img { max-width: 100%; }
  a { color: #2563eb; }
</style>
</head>
<body>{{ toHTML "file.md" }}</body>
</html>
HTML;

        $tmpDir = sys_get_temp_dir() . '/gotenberg_md_' . bin2hex(random_bytes(8));
        mkdir($tmpDir);
        $htmlFile = $tmpDir . '/index.html';
        $mdFile = $tmpDir . '/file.md';
        file_put_contents($htmlFile, $htmlWrapper);
        file_put_contents($mdFile, $markdownContent);

        try {
            $boundary = bin2hex(random_bytes(16));
            $body = '';

            foreach ([['path' => $htmlFile, 'name' => 'index.html', 'mime' => 'text/html'], ['path' => $mdFile, 'name' => 'file.md', 'mime' => 'text/markdown']] as $f) {
                $body .= "--{$boundary}\r\n";
                $body .= "Content-Disposition: form-data; name=\"files\"; filename=\"{$f['name']}\"\r\n";
                $body .= "Content-Type: {$f['mime']}\r\n\r\n";
                $body .= file_get_contents($f['path']) . "\r\n";
            }
            $body .= "--{$boundary}--\r\n";

            $response = $this->httpClient->request('POST', $this->gotenbergUrl . '/forms/chromium/convert/markdown', [
                'headers' => ['Content-Type' => 'multipart/form-data; boundary=' . $boundary],
                'body' => $body,
            ]);

            if ($response->getStatusCode() !== 200) {
                throw new \RuntimeException('Failed to convert Markdown: ' . $response->getContent(false));
            }

            return $response->getContent();
        } finally {
            @unlink($htmlFile);
            @unlink($mdFile);
            @rmdir($tmpDir);
        }
    }

    public function generateScreenshot(string $url): string
    {
        $formData = new FormDataPart(['url' => $url]);
        $headers = $formData->getPreparedHeaders()->toArray();

        $response = $this->httpClient->request('POST', $this->gotenbergUrl . '/forms/chromium/screenshot/url', [
            'headers' => $headers,
            'body' => $formData->bodyToIterable(),
        ]);

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException('Failed to generate screenshot: ' . $response->getContent(false));
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
