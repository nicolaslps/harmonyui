<?php

/*
 * This file is part of the HarmonyUI project.
 *
 * (c) Nicolas Lopes
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


use PhpCsFixer\Config;
use PhpCsFixer\Finder;

return (new Config())
    ->setRules([
        '@PHP82Migration' => true,
        '@PHPUnit100Migration:risky' => true,
        '@Symfony' => true,
        '@Symfony:risky' => true,
        'protected_to_private' => false,
        'header_comment' => [
            'header' => "This file is part of the HarmonyUI project.\n\n(c) Nicolas Lopes\n\nFor the full copyright and license information, please view the LICENSE\nfile that was distributed with this source code.",
        ],
        '@PSR12' => true,
        'declare_strict_types' => true,
        'strict_param' => true,
        'no_unused_imports' => true,
        'ordered_imports' => ['sort_algorithm' => 'alpha'],
    ])
    ->setRiskyAllowed(true)
    ->setCacheFile(__DIR__.'/.php-cs-fixer.cache')
    ->setFinder(
        Finder::create()
            ->files()
            ->name('*.php')
            ->in([
                __DIR__.'/apps/*/src',
                __DIR__.'/apps/*/tests',
                __DIR__.'/packages/*/src',
                __DIR__.'/packages/*/tests',
            ])
//            ->exclude(['var', 'vendor', 'node_modules', 'public/build', 'migrations'])
            ->notName('rector.php')
            ->notName('phpstan*')
    );
