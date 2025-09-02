<?php

declare(strict_types=1);

namespace HarmonyUi\Bundle\Style;

use InvalidArgumentException;
use Twig\Environment;
use Twig\Extra\Html\Cva;
use TailwindMerge\TailwindMerge;

/**
 * Registry for component styles. Renders CSS classes based on component
 * variants, themes, and props using CVA (Class Variance Authority).
 */
final class StyleRegistry
{
    private readonly ?TailwindMerge $tailwindMerge;

    /**
     * @param array<string, mixed> $map Component style definitions
     * @param Environment $twig Twig environment
     * @param bool $tailwindMergeEnabled Whether to use Tailwind merge
     */
    public function __construct(
        private readonly array $map,
        private readonly Environment $twig,
        private readonly bool $tailwindMergeEnabled = true,
    ) {
        $this->tailwindMerge = $tailwindMergeEnabled ? TailwindMerge::instance() : null;
    }

    /**
     * Render CSS classes for a component.
     *
     * @param string $key Component name
     * @param array<string, mixed> $props Component props and variants
     * @param string|null $theme Optional theme
     * @return string CSS classes
     */
    public function render(string $key, array $props = [], ?string $theme = null): string
    {
        $config = $this->get($key, $theme);
        $extraClasses = $props['class'] ?? '';
        unset($props['class']);

        if (is_string($config)) {
            $classes = $config;
        } else {
            $classes = $this->computeClasses($config, $props);
        }

        if ($extraClasses) {
            $classes .= ' ' . $extraClasses;
        }

        $classes = trim($classes);

        if ($this->tailwindMerge) {
            $classes = $this->tailwindMerge->merge($classes);
        }

        return $classes;
    }

    /**
     * Get component configuration.
     *
     * @param string $component Component name
     * @param string|null $theme Optional theme
     * @return array<string, mixed>|string Component config
     * @throws InvalidArgumentException If component not found
     */
    public function get(string $component, ?string $theme = null): array|string
    {
        if ($theme && isset($this->map[$component . '.' . $theme])) {
            return $this->map[$component . '.' . $theme];
        }

        if (isset($this->map[$component])) {
            return $this->map[$component];
        }

        throw new InvalidArgumentException("Component '$component' not found");
    }


    /**
     * Compute CSS classes using CVA (Class Variance Authority).
     *
     * @param array<string, mixed> $config Component configuration
     * @param array<string, mixed> $props Component props
     * @return string Computed CSS classes
     */
    private function computeClasses(array $config, array $props): string
    {
        $base = is_array($config['base'] ?? '') 
            ? implode(' ', $config['base'])
            : $config['base'] ?? '';

        $variants = [];
        foreach ($config['variants'] ?? [] as $name => $options) {
            foreach ($options as $key => $value) {
                $variants[$name][$key] = is_array($value) ? implode(' ', $value) : $value;
            }
        }

        $cva = new Cva(
            $base,
            $variants,
            $config['compoundVariants'] ?? [],
            $config['defaultVariants'] ?? []
        );

        return $cva->apply($props);
    }
}
