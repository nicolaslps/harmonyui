<?php

declare(strict_types=1);

namespace HarmonyUi\Bundle\DependencyInjection\Compiler;

use HarmonyUi\Bundle\Style\StyleLoader;
use Symfony\Component\Config\Resource\DirectoryResource;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

final class HarmonyUiPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if (!$container->hasParameter('ui.directories')) {
            return;
        }

        $directories = $container->getParameter('ui.directories');

        foreach ($directories as $directory) {
            if (is_dir($directory)) {
                $container->addResource(new DirectoryResource($directory));
            }
        }

        $loader = new StyleLoader();
        $map = $loader->loadFromDirectories($directories);
        
        $container->setParameter('ui.map', $map);

    }
}