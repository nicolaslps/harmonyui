<?php

/*
 * This file is part of the HarmonyUI project.
 *
 * (c) Nicolas Lopes
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

use TwigCsFixer\Config\Config;

$config = new Config();
$config->getFinder()->in([
    __DIR__ . '/apps/docs/templates',
//    __DIR__ . '/packages/ui-bundle/templates',
]);

return $config;