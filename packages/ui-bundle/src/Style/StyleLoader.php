<?php

declare(strict_types=1);

namespace HarmonyUi\Bundle\Style;

use FilesystemIterator;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use Symfony\Component\Yaml\Yaml;

/**
 * Loads component style definitions from YAML files.
 * Supports theme variants and recursive directory scanning.
 */
final class StyleLoader
{
    /**
     * Load style definitions from multiple directories.
     *
     * @param string[] $directories List of directory paths to scan
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
     * @param array<string, mixed> $map Existing style map
     * @param string $directory Directory path to scan
     * @return array<string, mixed> Updated style map
     */
    private function loadFromDirectory(array $map, string $directory): array
    {
        $files = $this->findYamlFiles($directory);

        foreach ($files as $file) {
            $content = $this->loadYamlFile($file);
            if ($content !== null) {
                $map = $this->mergeStyles($map, $content, $file);
            }
        }

        return $map;
    }

    /**
     * Find all YAML files in a directory recursively.
     *
     * @param string $directory Directory path to scan
     * @return string[] List of YAML file paths
     */
    private function findYamlFiles(string $directory): array
    {
        $files = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && preg_match('/\.(yml|yaml)$/i', $file->getFilename())) {
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
     * @return array<string, mixed>|null Parsed content or null if invalid
     */
    private function loadYamlFile(string $filePath): ?array
    {
        if (!is_readable($filePath)) {
            return null;
        }

        try {
            $content = Yaml::parseFile($filePath);
            return is_array($content) ? $content : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Merge YAML content with theme support.
     * Files named 'component.theme.yml' create themed variants.
     *
     * @param array<string, mixed> $map Existing style map
     * @param array<string, mixed> $content Parsed YAML content
     * @param string $filePath Path to the YAML file
     * @return array<string, mixed> Updated style map
     */
    private function mergeStyles(array $map, array $content, string $filePath): array
    {
        $filename = pathinfo($filePath, PATHINFO_FILENAME);
        $parts = explode('.', $filename);

        if (count($parts) > 1) {
            $theme = array_pop($parts);
            $themedContent = [];
            
            foreach ($content as $componentName => $componentConfig) {
                $themedContent[$componentName . '.' . $theme] = $componentConfig;
            }
            
            return array_merge_recursive($map, $themedContent);
        }
        
        return array_merge_recursive($map, $content);
    }


}