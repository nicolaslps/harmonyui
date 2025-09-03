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

/**
 * StyleExtension provides Twig functions and filters for rendering component styles.
 * It integrates with StyleRegistry to render CSS classes based on component configurations,
 * themes, and user props. Supports both function and filter syntax in templates.
 */
final class StyleExtension extends AbstractExtension
{
    /**
     * @param StyleRegistry $styleRegistry Registry containing component style definitions
     * @param Environment $twigEnvironment Twig environment
     */
    public function __construct(
        private readonly StyleRegistry $styleRegistry,
        private readonly Environment $twigEnvironment,
    ) {
    }

    #[\Override]
    public function getFunctions(): array
    {
        return [
            new TwigFunction('style', $this->style(...), ['needs_context' => true]),
            new TwigFunction('getStyleProps', $this->getStyleProps(...), ['needs_context' => true]),
        ];
    }

    #[\Override]
    public function getFilters(): array
    {
        return [
            new TwigFilter('style', $this->style(...), ['needs_context' => true]),
        ];
    }

    /**
     * Render CSS classes for a component using the style registry.
     *
     * @param array<string, mixed> $context Twig template context
     * @param string               $key     Component identifier (e.g., 'button', 'card')
     * @param array<string, mixed> $props   Component props including variants and classes
     * @param string|null          $theme   Optional theme override (defaults to context or global theme)
     *
     * @return string Rendered CSS classes
     */
    public function style(array $context, string $key, array $props = [], ?string $theme = null): string
    {
        if (null === $theme) {
            $globals = $this->twigEnvironment->getGlobals();
            $globalTheme = isset($globals['ui_theme']) && \is_string($globals['ui_theme']) ? $globals['ui_theme'] : null;
            $theme = isset($context['ui_theme']) && \is_string($context['ui_theme']) ? $context['ui_theme'] : $globalTheme;
        }

        return $this->styleRegistry->render($key, $props, $theme);
    }

    /**
     * Get component props with default values applied from component configuration.
     * Merges default variants with actual component attributes.
     *
     * @param array<string, mixed>     $context    Twig template context
     * @param string                   $component  Component identifier
     * @param ComponentAttributes|null $componentAttributes Component attributes from TwigComponent
     *
     * @return array<string, mixed> Final props with defaults applied
     *
     * @internal Used internally by the component system
     */
    public function getStyleProps(array $context, string $component, ?ComponentAttributes $componentAttributes = null): array
    {
        $theme = isset($context['ui_theme']) && \is_string($context['ui_theme']) ? $context['ui_theme'] : null;
        $config = $this->styleRegistry->get($component, $theme);

        if (\is_string($config)) {
            return [];
        }

        $defaults = \is_array($config['defaultVariants'] ?? null) ? $config['defaultVariants'] : [];
        $props = \is_array($config['variants'] ?? null) ? $config['variants'] : [];

        /** @var array<string, mixed> $realAttributes */
        $realAttributes = [];
        if ($componentAttributes instanceof \Symfony\UX\TwigComponent\ComponentAttributes) {
            $realAttributes = $componentAttributes->all();
        }

        /** @var array<string, mixed> $finalProps */
        $finalProps = [];
        foreach (array_keys($props) as $propName) {
            if (!\is_string($propName) || !\array_key_exists($propName, $realAttributes)) {
                $finalProps[$propName] = $defaults[$propName] ?? null;
                continue;
            }

            $finalProps[$propName] = $realAttributes[$propName];
        }

        return $finalProps;
    }
}
