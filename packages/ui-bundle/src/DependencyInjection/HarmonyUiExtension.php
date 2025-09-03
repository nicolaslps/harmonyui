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

namespace HarmonyUi\Bundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

class HarmonyUiExtension extends Extension
{
    /**
     * @param array<array<string, mixed>> $configs
     */
    public function load(array $configs, ContainerBuilder $containerBuilder): void
    {
        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $yamlFileLoader = new YamlFileLoader($containerBuilder, new FileLocator(__DIR__.'/../Resources/config'));
        $yamlFileLoader->load('services.yaml');

        $directories = [
            \dirname(__DIR__).'/Resources/config/styles',
            ...$config['paths'],
        ];

        $containerBuilder->setParameter('ui.directories', $directories);
        $containerBuilder->setParameter('ui.tailwind_merge_enabled', $config['tailwind_merge']);
    }
}
