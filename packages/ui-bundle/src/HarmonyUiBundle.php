<?php

namespace HarmonyUi\Bundle;

use HarmonyUi\Bundle\DependencyInjection\HarmonyUiExtension;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class HarmonyUiBundle extends Bundle
{
    public function getContainerExtension(): HarmonyUiExtension
    {
        return new HarmonyUiExtension();
    }
}