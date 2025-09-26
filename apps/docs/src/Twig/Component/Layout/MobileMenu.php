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

namespace App\Twig\Component\Layout;

use App\Entity\DocSection;
use App\Service\DocService;
use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

#[AsTwigComponent('Layout:MobileMenu', template: 'components/Layout/Doc/MobileMenu.html.twig')]
class MobileMenu
{
    public function __construct(private readonly DocService $docService)
    {
    }

    /**
     * @return DocSection[]
     */
    public function getDocPages(): array
    {
        return $this->docService->getSidebar();
    }
}
