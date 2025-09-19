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

namespace HarmonyUi\Bundle\Style;

use TailwindMerge\TailwindMerge;
use Twig\Extra\Html\Cva;

/**
 * Registry for component styles. Renders CSS classes based on component
 * variants and props using CVA (Class Variance Authority).
 */
final readonly class StyleRegistry
{
    private ?TailwindMerge $tailwindMerge;

    /**
     * @param array<string, mixed> $map                  Component style definitions
     * @param bool                 $tailwindMergeEnabled Whether to use Tailwind merge
     */
    public function __construct(
        private array $map,
        bool $tailwindMergeEnabled = true,
    ) {
        $this->tailwindMerge = $tailwindMergeEnabled ? TailwindMerge::instance() : null;
    }

    /**
     * Render CSS classes for a component.
     *
     * @param string               $key   Component name
     * @param array<string, mixed> $props Component props and variants
     *
     * @return string CSS classes
     */
    public function render(string $key, array $props = []): string
    {
        $config = $this->get($key);
        $extraClasses = $props['class'] ?? '';
        unset($props['class']);

        $classes = \is_string($config) ? $config : $this->computeClasses($config, $props);

        if ($extraClasses) {
            $classes .= ' '.$extraClasses;
        }

        $classes = trim($classes);

        if ($this->tailwindMerge instanceof TailwindMerge) {
            return $this->tailwindMerge->merge($classes);
        }

        return $classes;
    }

    /**
     * Get component configuration.
     *
     * @param string $component Component name
     *
     * @return array<string, mixed>|string Component config
     *
     * @throws \InvalidArgumentException If component not found
     */
    public function get(string $component): array|string
    {
        if (isset($this->map[$component])) {
            $config = $this->map[$component];

            return \is_array($config) || \is_string($config) ? $config : [];
        }

        throw new \InvalidArgumentException(\sprintf("Component '%s' not found", $component));
    }

    /**
     * Compute CSS classes using CVA (Class Variance Authority).
     *
     * @param array<string, mixed> $config Component configuration
     * @param array<string, mixed> $props  Component props
     *
     * @return string Computed CSS classes
     */
    private function computeClasses(array $config, array $props): string
    {
        $baseValue = $config['base'] ?? '';
        $base = \is_array($baseValue)
            ? implode(' ', $baseValue)
            : (\is_string($baseValue) ? $baseValue : '');

        $variants = [];
        $configVariants = $config['variants'] ?? [];
        if (\is_array($configVariants)) {
            foreach ($configVariants as $name => $options) {
                if (\is_array($options)) {
                    foreach ($options as $key => $value) {
                        $variants[(string) $name][(string) $key] = \is_array($value) ? implode(' ', $value) : (string) $value;
                    }
                }
            }
        }

        $compoundVariants = $config['compoundVariants'] ?? [];
        $defaultVariants = $config['defaultVariants'] ?? [];

        $cva = new Cva(
            $base,
            $variants,
            \is_array($compoundVariants) ? $compoundVariants : [],
            \is_array($defaultVariants) ? $defaultVariants : []
        );

        return $cva->apply($props);
    }
}
