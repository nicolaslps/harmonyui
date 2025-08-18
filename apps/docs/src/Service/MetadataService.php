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

namespace App\Service;

class MetadataService
{
    /**
     * @return array<string, mixed>
     */
    public function extractMetadata(string $templatePath): array
    {
        $defaults = [
            'title' => '',
            'description' => '',
            'order' => 9999,
            'canonical' => '',
            'component' => false,
            'section' => $this->extractSectionFromPath($templatePath),
        ];

        if (!file_exists($templatePath)) {
            return $defaults;
        }

        $content = file_get_contents($templatePath);
        if (false === $content) {
            return $defaults;
        }

        $metaArray = $this->extractMetaVariable($content);
        if ([] !== $metaArray) {
            $metadata = array_merge($defaults, $metaArray);
            $section = $metadata['section'];
            $metadata['parent'] = $this->getParentSection(\is_string($section) ? $section : '');

            return $metadata;
        }

        $defaults['parent'] = $this->getParentSection($defaults['section']);

        return $defaults;
    }

    /**
     * @return array<string, array{name: string, order: int, parent: string|null, pages: array<mixed>}>
     */
    public function getSectionHierarchy(): array
    {
        return [
            'overview' => [
                'name' => 'overview',
                'order' => 1,
                'parent' => null,
                'pages' => [],
            ],
            'handbook' => [
                'name' => 'handbook',
                'order' => 2,
                'parent' => null,
                'pages' => [],
            ],
            'components' => [
                'name' => 'components',
                'order' => 3,
                'parent' => null,
                'pages' => [],
            ],
        ];
    }

    private function extractSectionFromPath(string $templatePath): string
    {
        // Extract section from template path like templates_docs/components/button.html.twig
        if (preg_match('/templates_docs\/([^\/]+)/', $templatePath, $matches)) {
            return $matches[1];
        }

        return 'unknown';
    }

    private function getParentSection(string $section): ?string
    {
        $hierarchy = $this->getSectionHierarchy();
        $sectionData = $hierarchy[$section] ?? null;

        return $sectionData ? $sectionData['parent'] : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function extractMetaVariable(string $content): array
    {
        if (preg_match('/\{%\s*set\s+meta\s*=\s*\{(.*?)}\s*%}/s', $content, $matches)) {
            $metaContent = $matches[1];

            return $this->parseMetaContent($metaContent);
        }

        return [];
    }

    /**
     * @return array<string, mixed>
     */
    private function parseMetaContent(string $metaContent): array
    {
        $data = [];

        // Split by commas that are not inside function calls or strings
        $items = $this->splitMetaItems($metaContent);

        foreach ($items as $item) {
            $item = trim($item);
            if ('' === $item) {
                continue;
            }

            if ('0' === $item) {
                continue;
            }

            if (!str_contains($item, ':')) {
                continue;
            }

            [$key, $value] = explode(':', $item, 2);
            $key = trim($key);
            $value = trim($value);

            // Remove quotes from string values
            if (preg_match('/^[\'"](.*)[\'"]$/', $value, $matches)) {
                $value = $matches[1];
            }

            // Convert string values to appropriate types
            if ('true' === $value) {
                $value = true;
            } elseif ('false' === $value) {
                $value = false;
            } elseif (is_numeric($value)) {
                $value = (int) $value;
            }

            $data[$key] = $value;
        }

        return $data;
    }

    /**
     * @return array<string>
     */
    private function splitMetaItems(string $content): array
    {
        $items = [];
        $current = '';
        $depth = 0;
        $inString = false;
        $stringChar = '';

        for ($i = 0; $i < \strlen($content); ++$i) {
            $char = $content[$i];

            if (!$inString && ('"' === $char || "'" === $char)) {
                $inString = true;
                $stringChar = $char;
            } elseif ($inString && $char === $stringChar) {
                $inString = false;
                $stringChar = '';
            } elseif (!$inString && '(' === $char) {
                ++$depth;
            } elseif (!$inString && ')' === $char) {
                --$depth;
            } elseif (!$inString && ',' === $char && 0 === $depth) {
                $items[] = trim($current);
                $current = '';

                continue;
            }

            $current .= $char;
        }

        if (!\in_array(trim($current), ['', '0'], true)) {
            $items[] = trim($current);
        }

        return $items;
    }
}
