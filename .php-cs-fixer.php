<?php

/*
 * This file is part of the HarmonyUI project.
 *
 * (c) Nicolas Lopes
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

return (new PhpCsFixer\Config())
    ->setRules([
        '@PHP82Migration' => true,
        '@PHPUnit100Migration:risky' => true,
        '@Symfony' => true,
        '@Symfony:risky' => true,
        'protected_to_private' => false,
        'header_comment' => [
            'header' => 'This file is part of the HarmonyUI project.

(c) Nicolas Lopes

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.',
        ],
    ])
    ->setRiskyAllowed(true)
    ->setFinder(
        (new PhpCsFixer\Finder())
            ->in([
                __DIR__.'/apps',
                __DIR__.'/packages',
            ])
            ->append([__FILE__])
            ->notPath('#/vendor/#')
            ->notPath('#/var/#')
            ->notPath('#/node_modules/#')
            ->notPath('#/public/build/#')
            ->notPath('#/migrations/#')
    );
