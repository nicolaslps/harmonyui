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

use App\Entity\DocPage;
use App\Entity\DocSection;
use App\Enum\PageType;

class DocService
{
    private readonly string $docPath;

    public function __construct(
        private readonly MetadataService $metadataService,
    ) {
        $this->docPath = dirname(__DIR__, 2).'/templates/documentation';
    }

    /**
     * @return DocSection[]
     */
    private function buildDocumentationTree(): array
    {
        if (!is_dir($this->docPath)) {
            return [];
        }

        $sections = [];
        $scanResult = scandir($this->docPath);
        if (false === $scanResult) {
            return [];
        }

        $sectionDirectories = array_diff($scanResult, ['.', '..']);

        foreach ($sectionDirectories as $sectionDirectory) {
            $sectionPath = $this->docPath.\DIRECTORY_SEPARATOR.$sectionDirectory;

            if (is_dir($sectionPath)) {
                $section = $this->createSectionFromDirectory($sectionDirectory, $sectionPath);
                if ($section instanceof DocSection) {
                    $sections[] = $section;
                }
            }
        }

        return $this->sortSectionsByOrder($sections);
    }

    private function createSectionFromDirectory(string $directoryName, string $sectionPath): ?DocSection
    {
        $sectionMetadata = $this->getSectionMetadata($directoryName);

        $docSection = new DocSection();
        $docSection->setTitle($sectionMetadata['name']);
        $docSection->setSlug($directoryName);
        $docSection->setDescription($sectionMetadata['description'] ?? null);
        $docSection->setSortOrder($sectionMetadata['order']);

        $pageScanResult = scandir($sectionPath);
        if (false === $pageScanResult) {
            return null;
        }

        $pageFiles = array_diff($pageScanResult, ['.', '..']);

        foreach ($pageFiles as $pageFile) {
            if ('twig' === pathinfo($pageFile, \PATHINFO_EXTENSION)) {
                $filePath = $sectionPath.\DIRECTORY_SEPARATOR.$pageFile;
                $page = $this->createPageFromFile($filePath, $docSection);

                if ($page instanceof DocPage) {
                    $docSection->addPage($page);
                }
            }
        }

        return [] !== $docSection->getPages() ? $docSection : null;
    }

    private function createPageFromFile(string $filePath, DocSection $docSection): ?DocPage
    {
        $metadata = $this->metadataService->extractMetadata($filePath);

        if (!isset($metadata['title']) || !isset($metadata['slug'])) {
            return null;
        }

        $docPage = new DocPage();
        $docPage->setTitle(\is_string($metadata['title']) ? $metadata['title'] : '');
        $docPage->setSlug(\is_string($metadata['slug']) ? $metadata['slug'] : '');
        $docPage->setDescription(
            isset($metadata['description']) && \is_string($metadata['description'])
                ? $metadata['description']
                : null
        );
        $docPage->setType($this->determinePageType($metadata));
        $docPage->setIsPublished((bool) ($metadata['published'] ?? true));
        $docPage->setSection($docSection);
        $docPage->setTemplate($this->getTemplatePathFromFile($filePath));
        $docPage->setImage(
            isset($metadata['image']) && \is_string($metadata['image'])
                ? $metadata['image']
                : null
        );

        return $docPage;
    }

    /**
     * @return array{name: string, order: int, description: string|null}
     */
    private function getSectionMetadata(string $directoryName): array
    {
        $sectionHierarchy = $this->metadataService->getSectionHierarchy();

        if (isset($sectionHierarchy[$directoryName])) {
            $section = $sectionHierarchy[$directoryName];

            return [
                'name' => $section['name'],
                'order' => $section['order'],
                'description' => null,
            ];
        }

        return [
            'name' => ucfirst(str_replace(['-', '_'], ' ', $directoryName)),
            'order' => 999,
            'description' => null,
        ];
    }

    /**
     * @param array<string, mixed> $metadata
     */
    private function determinePageType(array $metadata): PageType
    {
        return ($metadata['isComponent'] ?? false) ? PageType::COMPONENT : PageType::PAGE;
    }

    private function getTemplatePathFromFile(string $filePath): string
    {
        $templateBasePath = \dirname(__DIR__, 2).'/templates/';

        if (str_starts_with($filePath, $templateBasePath)) {
            return str_replace($templateBasePath, '', $filePath);
        }

        return $filePath;
    }

    /**
     * @param DocSection[] $sections
     *
     * @return DocSection[]
     */
    private function sortSectionsByOrder(array $sections): array
    {
        usort($sections, static fn (DocSection $a, DocSection $b): int => $a->getSortOrder() <=> $b->getSortOrder());

        return $sections;
    }

    /**
     * @return DocSection[]
     */
    public function getAllSections(): array
    {
        return $this->buildDocumentationTree();
    }

    public function getComponentsSection(): ?DocSection
    {
        foreach ($this->getAllSections() as $docSection) {
            if ('components' === $docSection->getSlug()) {
                return $docSection;
            }
        }

        return null;
    }

    /**
     * @return DocPage[]
     */
    public function getComponents(): array
    {
        $componentsSection = $this->getComponentsSection();

        return $componentsSection instanceof DocSection ? $componentsSection->getPages() : [];
    }

    public function getSection(string $slug): ?DocSection
    {
        foreach ($this->getAllSections() as $docSection) {
            if ($docSection->getSlug() === $slug) {
                return $docSection;
            }
        }

        return null;
    }

    public function getPage(string $sectionSlug, string $pageSlug): ?DocPage
    {
        $section = $this->getSection($sectionSlug);
        if (!$section instanceof DocSection) {
            return null;
        }

        foreach ($section->getPages() as $docPage) {
            if ($docPage->getPageSlug() === $pageSlug) {
                return $docPage;
            }
        }

        return null;
    }

    /**
     * @return DocSection[]
     */
    public function getSidebar(): array
    {
        return $this->getAllSections();
    }
}
