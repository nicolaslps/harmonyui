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

namespace HarmonyUi\Bundle\Twig;

/**
 * Parser for extracting component props from Twig component templates.
 * Parses the {%- props ... -%} directive to extract property definitions.
 */
final readonly class ComponentPropsParser
{
    /**
     * @param string $templatesPath Path to the component templates directory
     */
    public function __construct(
        private string $templatesPath,
    ) {
    }

    /**
     * Get props for a component by parsing its template file.
     *
     * @param string $component Component name (e.g., 'button', 'separator')
     *
     * @return array<int, array{name: string, type: string, default: mixed}> Array of props
     */
    public function getProps(string $component): array
    {
        $templatePath = $this->resolveTemplatePath($component);

        if (!file_exists($templatePath)) {
            return [];
        }

        $content = file_get_contents($templatePath);
        if ($content === false) {
            return [];
        }

        return $this->parseProps($content);
    }

    /**
     * Get props for a component and all its child components.
     *
     * @param string $component Component name (e.g., 'drawer')
     *
     * @return array<string, array<int, array{name: string, type: string, default: mixed}>> Props grouped by component
     */
    public function getPropsWithChildren(string $component): array
    {
        $result = [];

        // Get props for main component
        $mainProps = $this->getProps($component);
        if (!empty($mainProps)) {
            $result[$component] = $mainProps;
        }

        // Check for child components
        $componentDir = $this->resolveComponentDirectory($component);
        if (is_dir($componentDir)) {
            $children = $this->findChildComponents($componentDir);
            foreach ($children as $childName => $childProps) {
                if (!empty($childProps)) {
                    $result[$component.':'.$childName] = $childProps;
                }
            }
        }

        return $result;
    }

    /**
     * Resolve the component directory path.
     *
     * @param string $component Component name
     *
     * @return string Full path to the component directory
     */
    private function resolveComponentDirectory(string $component): string
    {
        $fileName = str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $component)));

        return $this->templatesPath.'/'.$fileName;
    }

    /**
     * Find and parse all child components in a directory.
     *
     * @param string $directory Component directory path
     *
     * @return array<string, array<int, array{name: string, type: string, default: mixed}>> Props grouped by child component
     */
    private function findChildComponents(string $directory): array
    {
        $children = [];

        if (!is_dir($directory)) {
            return $children;
        }

        $files = scandir($directory);
        if ($files === false) {
            return $children;
        }

        foreach ($files as $file) {
            if ($file === '.' || $file === '..' || !str_ends_with($file, '.html.twig')) {
                continue;
            }

            $childName = str_replace('.html.twig', '', $file);
            $filePath = $directory.'/'.$file;

            $content = file_get_contents($filePath);
            if ($content === false) {
                continue;
            }

            $props = $this->parseProps($content);
            if (!empty($props)) {
                $children[$childName] = $props;
            }
        }

        return $children;
    }

    /**
     * Resolve the template path for a component.
     *
     * @param string $component Component name
     *
     * @return string Full path to the template file
     */
    private function resolveTemplatePath(string $component): string
    {
        // Convert component name to PascalCase for file name
        $fileName = str_replace(' ', '', ucwords(str_replace(['-', '_'], ' ', $component)));

        return $this->templatesPath.'/'.$fileName.'.html.twig';
    }

    /**
     * Parse props from template content.
     *
     * @param string $content Template content
     *
     * @return array<int, array{name: string, type: string, default: mixed}> Array of props
     */
    private function parseProps(string $content): array
    {
        // Match {%- props ... -%} directive
        if (!preg_match('/\{%-?\s*props\s+([^%]+?)\s*-?%\}/', $content, $matches)) {
            return [];
        }

        $propsString = trim($matches[1]);
        $props = [];

        // Split by comma but respect nested structures
        $parts = $this->splitProps($propsString);

        foreach ($parts as $part) {
            $part = trim($part);
            if (empty($part)) {
                continue;
            }

            // Parse: name = value
            if (preg_match('/^(\w+)\s*=\s*(.+)$/', $part, $propMatches)) {
                $name = $propMatches[1];
                $defaultValue = trim($propMatches[2]);

                $props[] = [
                    'name' => $name,
                    'type' => $this->inferType($defaultValue),
                    'default' => $this->parseValue($defaultValue),
                ];
            } elseif (preg_match('/^(\w+)$/', $part, $propMatches)) {
                // Prop without default value
                $props[] = [
                    'name' => $propMatches[1],
                    'type' => 'mixed',
                    'default' => null,
                ];
            }
        }

        return $props;
    }

    /**
     * Split props string by comma, respecting nested structures.
     *
     * @param string $propsString Props string
     *
     * @return array<int, string> Array of prop strings
     */
    private function splitProps(string $propsString): array
    {
        $parts = [];
        $current = '';
        $depth = 0;

        for ($i = 0; $i < \strlen($propsString); ++$i) {
            $char = $propsString[$i];

            if ($char === '[' || $char === '{') {
                ++$depth;
            } elseif ($char === ']' || $char === '}') {
                --$depth;
            } elseif ($char === ',' && $depth === 0) {
                $parts[] = $current;
                $current = '';
                continue;
            }

            $current .= $char;
        }

        if ($current !== '') {
            $parts[] = $current;
        }

        return $parts;
    }

    /**
     * Infer the type from a default value.
     *
     * @param string $value Value string
     *
     * @return string Type string
     */
    private function inferType(string $value): string
    {
        $value = trim($value);

        if ($value === 'null') {
            return 'mixed';
        }

        if ($value === 'true' || $value === 'false') {
            return 'bool';
        }

        if (preg_match('/^["\'].*["\']$/', $value)) {
            return 'string';
        }

        if (is_numeric($value)) {
            return str_contains($value, '.') ? 'float' : 'int';
        }

        if ($value[0] === '[') {
            return 'array';
        }

        return 'mixed';
    }

    /**
     * Parse a value string to its actual PHP value.
     *
     * @param string $value Value string
     *
     * @return mixed Parsed value
     */
    private function parseValue(string $value): mixed
    {
        $value = trim($value);

        if ($value === 'null') {
            return null;
        }

        if ($value === 'true') {
            return true;
        }

        if ($value === 'false') {
            return false;
        }

        if (preg_match('/^["\'](.*)["\']\s*$/', $value, $matches)) {
            return $matches[1];
        }

        if (is_numeric($value)) {
            return str_contains($value, '.') ? (float) $value : (int) $value;
        }

        return $value;
    }
}
