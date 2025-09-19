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

namespace HarmonyUi\Bundle\Style;

use Symfony\Component\Yaml\Yaml;

/**
 * Loads component style definitions from YAML files.
 * Supports recursive directory scanning.
 */
final class StyleLoader
{
    /**
     * Load style definitions from multiple directories.
     *
     * @param string[] $directories List of directory paths to scan
     *
     * @return array<string, mixed> Style map with all loaded definitions
     */
    public function loadFromDirectories(array $directories): array
    {
        $map = [];

        foreach ($directories as $directory) {
            if (is_dir($directory)) {
                $map = $this->loadFromDirectory($map, $directory);
            }
        }

        return $map;
    }

    /**
     * Load style definitions from a directory.
     *
     * @param array<string, mixed> $map       Existing style map
     * @param string               $directory Directory path to scan
     *
     * @return array<string, mixed> Updated style map
     */
    private function loadFromDirectory(array $map, string $directory): array
    {
        $files = $this->findYamlFiles($directory);

        foreach ($files as $file) {
            $content = $this->loadYamlFile($file);
            if (null !== $content) {
                $map = $this->mergeStyles($map, $content);
            }
        }

        return $map;
    }

    /**
     * Find all YAML files in a directory recursively.
     *
     * @param string $directory Directory path to scan
     *
     * @return string[] List of YAML file paths
     */
    private function findYamlFiles(string $directory): array
    {
        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file instanceof \SplFileInfo && $file->isFile() && preg_match('/\.(yml|yaml)$/i', $file->getFilename())) {
                $files[] = $file->getPathname();
            }
        }

        sort($files);

        return $files;
    }

    /**
     * Load and parse a YAML file safely.
     *
     * @param string $filePath Path to YAML file
     *
     * @return array<string, mixed>|null Parsed content or null if invalid
     */
    private function loadYamlFile(string $filePath): ?array
    {
        if (!is_readable($filePath)) {
            return null;
        }

        try {
            $content = Yaml::parseFile($filePath);

            return \is_array($content) ? $content : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Merge YAML content into the style map.
     *
     * @param array<string, mixed> $map     Existing style map
     * @param array<string, mixed> $content Parsed YAML content
     *
     * @return array<string, mixed> Updated style map
     */
    private function mergeStyles(array $map, array $content): array
    {
        return array_merge_recursive($map, $content);
    }
}
