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

namespace App\Twig\Extension;

use Symfony\Component\Asset\Packages;
use Symfony\Component\Filesystem\Filesystem;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AssetExtension extends AbstractExtension
{
    public function __construct(
        private readonly string $publicDir,
        private readonly Packages $packages,
        private readonly Filesystem $filesystem
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('inline_svg', [$this, 'inlineSvg'], ['is_safe' => ['html']]),
        ];
    }

    public function inlineSvg(string $path): string
    {
        $fullPath = $this->publicDir . '/' . ltrim($path, '/');

        if (!$this->filesystem->exists($fullPath) || !str_ends_with(strtolower($path), '.svg')) {
            return '';
        }

        try {
            return file_get_contents($fullPath) ?: '';
        } catch (\Exception) {
            return '';
        }
    }
}
