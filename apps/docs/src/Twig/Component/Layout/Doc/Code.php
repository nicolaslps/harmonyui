<?php

namespace App\Twig\Component\Layout\Doc;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;
use Twig\Environment;
use Tempest\Highlight\Highlighter;

#[AsTwigComponent('Code', template: 'components/Layout/Doc/Code.html.twig')]
class Code
{
    public string $title = 'Code';
    public string|array $files = '';
    public string $language = 'twig';

    private Environment $twig;
    private Highlighter $highlighter;

    public function __construct(Environment $twig)
    {
        $this->twig = $twig;
        $this->highlighter = new Highlighter();
    }

    public function getFormattedCodes(): array
    {
        $files = is_string($this->files) ? [$this->files] : $this->files;
        $formattedCodes = [];

        foreach ($files as $file) {
            $formattedCodes[] = $this->formatCode($file);
        }

        return $formattedCodes;
    }

    private function formatCode(string $filePath): array
    {
        try {
            $loader = $this->twig->getLoader();

            if (!$loader->exists($filePath)) {
                return [
                    'file' => $filePath,
                    'rawCode' => "File not found: {$filePath}",
                    'highlightedCode' => "File not found: {$filePath}",
                    'language' => 'text',
                    'error' => true
                ];
            }

            $source = $loader->getSourceContext($filePath);
            $rawCode = $source->getCode();

            $language = $this->detectLanguage($filePath);

            try {
                $highlightedCode = $this->highlighter->parse($rawCode, $language);
            } catch (\Exception $e) {
                $highlightedCode = htmlspecialchars($rawCode, ENT_QUOTES, 'UTF-8');
            }

            return [
                'file' => $filePath,
                'rawCode' => $rawCode,
                'highlightedCode' => $highlightedCode,
                'language' => $language,
                'error' => false
            ];

        } catch (\Exception $e) {
            return [
                'file' => $filePath,
                'rawCode' => "Error loading file: " . $e->getMessage(),
                'highlightedCode' => "Error loading file: " . $e->getMessage(),
                'language' => 'text',
                'error' => true
            ];
        }
    }

    private function detectLanguage(string $filePath): string
    {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);

        return match ($extension) {
            'twig' => 'twig',
            'php' => 'php',
            'js' => 'javascript',
            'ts' => 'typescript',
            'css' => 'css',
            'scss' => 'scss',
            'html' => 'html',
            'yml', 'yaml' => 'yaml',
            'json' => 'json',
            'xml' => 'xml',
            default => $this->language
        };
    }
}
