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

namespace App\Enum;

enum PageType: string
{
    case PAGE = 'page';
    case COMPONENT = 'component';

    public function getLabel(): string
    {
        return match ($this) {
            self::COMPONENT => 'doc.page.type.component',
            default => 'doc.page.type.page',
        };
    }
}
