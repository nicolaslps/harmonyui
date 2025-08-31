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

namespace HarmonyUi\Bundle\Twig;

use HarmonyUi\Bundle\Style\StyleRegistry;
use Symfony\UX\TwigComponent\ComponentAttributes;
use Twig\Environment;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

final class StyleExtension extends AbstractExtension
{
    public function __construct(
        private readonly StyleRegistry $styleRegistry,
        private readonly Environment $twig,
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('style', [$this, 'style'], ['needs_context' => true]),
            new TwigFunction('getStyleProps', [$this, 'getStyleProps'], ['needs_context' => true]),
        ];
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('style', [$this, 'style'], ['needs_context' => true]),
        ];
    }

    public function style(array $context, string $key, array $props = [], ?string $theme = null): string
    {
        if ($theme === null) {
            $theme = $context['ui_theme'] ?? $this->twig->getGlobals()['ui_theme'] ?? null;
        }
        return $this->styleRegistry->render($key, $props, $theme);
    }

    /**
     * return component props with defaults applied
     * @internal
     */
    public function getStyleProps(array $context, string $component, ?ComponentAttributes $attributes = null): array
    {
        $theme = $context['ui_theme'] ?? null;
        $config = $this->styleRegistry->get($component, 'root', $theme);

        $defaults = $config['defaultVariants'];
        $props = $config['variants'];

        $realAttributes = [];
        if (!is_null($attributes)) {
            $realAttributes = $attributes->all();
        }

        $finalProps = [];
        foreach ($props as $propName => $propValues) {
            if (!array_key_exists($propName, $realAttributes)) {
                $finalProps[$propName] = $defaults[$propName] ?? null;
                continue;
            }
            $finalProps[$propName] = $realAttributes[$propName];
        }
        return $finalProps;
    }
}