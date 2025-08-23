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

namespace HarmonyUi\Bundle;

use HarmonyUi\Bundle\DependencyInjection\HarmonyUiExtension;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class HarmonyUiBundle extends Bundle
{
    public function getContainerExtension(): HarmonyUiExtension
    {
        return new HarmonyUiExtension();
    }
}
