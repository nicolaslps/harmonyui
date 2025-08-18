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
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class DocsController extends AbstractController
{
    public function __construct(
        private readonly DocService $docService,
    ) {
    }

    #[Route('/', name: 'app_home')]
    public function home(): Response
    {
        return $this->render('docs/home.html.twig');
    }

    #[Route('/components', name: 'app_components')]
    public function components(): Response
    {
        $components = $this->docService->getComponents();

        return $this->render('docs/components.html.twig', [
            'components' => $components,
        ]);
    }

    #[Route('/docs/{section}/{page}', name: 'app_docs')]
    public function docs(?string $section = null, ?string $page = null): Response
    {
        if (null === $section || null === $page) {
            throw $this->createNotFoundException('Section and page parameters are required');
        }

        $sidebar = $this->docService->getSidebar();
        $page = $this->docService->getPage($section, $page);

        return $this->render('docs/docs.html.twig', [
            'sidebar' => $sidebar,
            'page' => $page,
        ]);
    }
}
