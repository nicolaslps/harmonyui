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

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

final class Configuration implements ConfigurationInterface
{
    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('ui');

        // @phpstan-ignore-next-line TreeBuilder root node is always ArrayNodeDefinition for root nodes
        $treeBuilder->getRootNode()
            ->children()
                ->arrayNode('paths')
                    ->defaultValue(['%kernel.project_dir%/styles'])
                    ->scalarPrototype()->end()
                ->end()
                ->booleanNode('tailwind_merge')
                    ->defaultTrue()
                ->end()
            ->end()
        ;

        return $treeBuilder;
    }
}
