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

namespace App\Controller;

use App\Service\DocService;
use DOMDocument;
use DOMException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

final class SitemapController extends AbstractController
{
    public function __construct(
        private readonly DocService $docService,
    ) {
    }

    /**
     * Generates XML sitemap containing all public pages and published components.
     */
    #[Route('/sitemap.xml', name: 'sitemap', methods: ['GET'])]
    public function sitemap(): Response
    {
        try {
            $urls = $this->buildSitemapUrls();
            $xml = $this->createSitemapXml($urls);

            $response = new Response($xml->saveXML());
            $response->headers->set('Content-Type', 'application/xml; charset=UTF-8');

            return $response;
        } catch (DOMException $e) {
            return new Response(
                '<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap: ' . htmlspecialchars($e->getMessage()) . '</error>',
                500,
                ['Content-Type' => 'application/xml; charset=UTF-8']
            );
        }
    }

    /**
     * @return array<int, array{loc: string, priority: string}>
     */
    private function buildSitemapUrls(): array
    {
        $urls = [
            [
                'loc' => $this->generateUrl('front_landing_index', [], UrlGeneratorInterface::ABSOLUTE_URL),
                'priority' => '1.00',
            ],
            [
                'loc' => $this->generateUrl('app_components', [], UrlGeneratorInterface::ABSOLUTE_URL),
                'priority' => '0.80',
            ],
        ];

        $components = $this->docService->getComponents();
        foreach ($components as $component) {
            if (!$component->isPublished()) {
                continue;
            }

            $sectionSlug = $component->getSectionSlug();
            $pageSlug = $component->getPageSlug();

            if (null === $sectionSlug || null === $pageSlug) {
                continue;
            }

            try {
                $url = $this->generateUrl('app_docs', [
                    'section' => $sectionSlug,
                    'page' => $pageSlug,
                ], UrlGeneratorInterface::ABSOLUTE_URL);

                $urls[] = [
                    'loc' => $url,
                    'priority' => '0.64',
                ];
            } catch (\Exception $e) {
                // Skip this URL if it can't be generated
                continue;
            }
        }

        return $urls;
    }

    /**
     * @param array<int, array{loc: string, priority: string}> $urls
     * @throws DOMException
     */
    private function createSitemapXml(array $urls): DOMDocument
    {
        $xml = new DOMDocument('1.0', 'UTF-8');
        $xml->formatOutput = true;

        $urlset = $xml->createElement('urlset');
        $urlset->setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
        $urlset->setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        $urlset->setAttribute('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd');
        $xml->appendChild($urlset);

        foreach ($urls as $urlData) {
            $urlElement = $this->createUrlElement($xml, $urlData);
            $urlset->appendChild($urlElement);
        }

        return $xml;
    }

    /**
     * @param array{loc: string, priority: string} $urlData
     * @throws DOMException
     */
    private function createUrlElement(DOMDocument $xml, array $urlData): \DOMElement
    {
        $urlElement = $xml->createElement('url');

        $locElement = $xml->createElement('loc');
        $locElement->textContent = $urlData['loc'];
        $urlElement->appendChild($locElement);

        $lastmodElement = $xml->createElement('lastmod');
        $lastmodElement->textContent = date('c');
        $urlElement->appendChild($lastmodElement);

        $priorityElement = $xml->createElement('priority');
        $priorityElement->textContent = $urlData['priority'];
        $urlElement->appendChild($priorityElement);

        return $urlElement;
    }
}
