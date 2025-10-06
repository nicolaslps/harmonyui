<?php

declare(strict_types=1);

/*
 * This file is part of the HarmonyUI project.
 *
 * (c) Nicolas Lopes
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace App\Twig\Component\Layout\Doc;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;
use Tempest\Highlight\Highlighter;
use Twig\Environment;

#[AsTwigComponent('Code', template: 'components/Layout/Doc/Code.html.twig')]
class Code
{
    public string $title = 'Code';

    /** @var string|array<string> */
    public string|array $files = '';

    public string $language = 'twig';

    private readonly Highlighter $highlighter;

    public function __construct(private readonly Environment $twigEnvironment)
    {
        $this->highlighter = new Highlighter();
    }

    /**
     * @return array<array{file: string, rawCode: string, highlightedCode: string, language: string, error: bool}>
     */
    public function getFormattedCodes(string $slotContent = ''): array
    {
        if ('' !== $slotContent) {
            return [$this->formatContent($slotContent)];
        }

        $files = \is_string($this->files) ? [$this->files] : $this->files;
        $formattedCodes = [];

        foreach ($files as $file) {
            $formattedCodes[] = $this->formatCode($file);
        }

        return $formattedCodes;
    }

    /**
     * @return array{file: string, rawCode: string, highlightedCode: string, language: string, error: bool}
     */
    private function formatContent(string $content): array
    {
        try {
            $highlightedCode = $this->highlighter->parse($content, $this->language);
        } catch (\Exception) {
            $highlightedCode = htmlspecialchars($content, \ENT_QUOTES, 'UTF-8');
        }

        return [
            'file' => '',
            'rawCode' => $content,
            'highlightedCode' => $highlightedCode,
            'language' => $this->language,
            'error' => false,
        ];
    }

    /**
     * @return array{file: string, rawCode: string, highlightedCode: string, language: string, error: bool}
     */
    private function formatCode(string $filePath): array
    {
        try {
            $loader = $this->twigEnvironment->getLoader();

            if (!$loader->exists($filePath)) {
                return [
                    'file' => $filePath,
                    'rawCode' => 'File not found: '.$filePath,
                    'highlightedCode' => 'File not found: '.$filePath,
                    'language' => 'text',
                    'error' => true,
                ];
            }

            $source = $loader->getSourceContext($filePath);
            $rawCode = $source->getCode();

            $language = $this->detectLanguage($filePath);

            try {
                $highlightedCode = $this->highlighter->parse($rawCode, $language);
            } catch (\Exception) {
                $highlightedCode = htmlspecialchars($rawCode, \ENT_QUOTES, 'UTF-8');
            }

            return [
                'file' => $filePath,
                'rawCode' => $rawCode,
                'highlightedCode' => $highlightedCode,
                'language' => $language,
                'error' => false,
            ];
        } catch (\Exception $exception) {
            return [
                'file' => $filePath,
                'rawCode' => 'Error loading file: '.$exception->getMessage(),
                'highlightedCode' => 'Error loading file: '.$exception->getMessage(),
                'language' => 'text',
                'error' => true,
            ];
        }
    }

    private function detectLanguage(string $filePath): string
    {
        $extension = pathinfo($filePath, \PATHINFO_EXTENSION);

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
            default => $this->language,
        };
    }
}
