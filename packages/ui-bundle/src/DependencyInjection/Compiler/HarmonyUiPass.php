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

namespace HarmonyUi\Bundle\DependencyInjection\Compiler;

use HarmonyUi\Bundle\Style\StyleLoader;
use Symfony\Component\Config\Resource\DirectoryResource;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class HarmonyUiPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $containerBuilder): void
    {
        if (!$containerBuilder->hasParameter('ui.directories')) {
            return;
        }

        $directories = $containerBuilder->getParameter('ui.directories');

        if (!\is_array($directories)) {
            return;
        }

        foreach ($directories as $directory) {
            if (\is_string($directory) && is_dir($directory)) {
                $containerBuilder->addResource(new DirectoryResource($directory));
            }
        }

        $styleLoader = new StyleLoader();
        $map = $styleLoader->loadFromDirectories($directories);

        $containerBuilder->setParameter('ui.map', $map);
    }
}
