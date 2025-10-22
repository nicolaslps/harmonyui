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

namespace App\Controller;

use App\Form\FormDemoType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class FormDemoController extends AbstractController
{
    #[Route('/demo/form', name: 'app_demo_form')]
    public function index(Request $request): Response
    {
        $form = $this->createForm(FormDemoType::class);
        return $this->render('form_demo/index.html.twig', [
            'form' => $form,
        ]);
    }
}
