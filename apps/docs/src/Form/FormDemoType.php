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

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\BirthdayType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\ColorType;
use Symfony\Component\Form\Extension\Core\Type\CountryType;
use Symfony\Component\Form\Extension\Core\Type\CurrencyType;
use Symfony\Component\Form\Extension\Core\Type\DateIntervalType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\Extension\Core\Type\LanguageType;
use Symfony\Component\Form\Extension\Core\Type\LocaleType;
use Symfony\Component\Form\Extension\Core\Type\MoneyType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\PercentType;
use Symfony\Component\Form\Extension\Core\Type\RangeType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\Extension\Core\Type\SearchType;
use Symfony\Component\Form\Extension\Core\Type\TelType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TimeType;
use Symfony\Component\Form\Extension\Core\Type\TimezoneType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\Extension\Core\Type\WeekType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

final class FormDemoType extends AbstractType
{
    public function buildForm(FormBuilderInterface $formBuilder, array $options): void
    {
        $formBuilder
            ->add('text', TextType::class, [
                'label' => 'Text ',
                'required' => false,
            ])
            ->add('email', EmailType::class, [
                'label' => 'Email',
                'required' => false,
            ])
            ->add('password', PasswordType::class, [
                'label' => 'Password',
                'required' => false,
            ])
            ->add('repeatedPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'first_options' => ['label' => 'Password'],
                'second_options' => ['label' => 'Repeat Password'],
                'required' => false,
            ])
            ->add('search', SearchType::class, [
                'label' => 'Search',
                'required' => false,
            ])
            ->add('url', UrlType::class, [
                'label' => 'URL',
                'required' => false,
            ])
            ->add('tel', TelType::class, [
                'label' => 'Telephone',
                'required' => false,
            ])
            ->add('textarea', TextareaType::class, [
                'label' => 'Textarea',
                'required' => false,
            ])
            ->add('color', ColorType::class, [
                'label' => 'Color Picker',
                'required' => false,
            ])

            ->add('integer', IntegerType::class, [
                'label' => 'Integer',
                'required' => false,
            ])
            ->add('number', NumberType::class, [
                'label' => 'Number (decimal)',
                'required' => false,
            ])
            ->add('money', MoneyType::class, [
                'label' => 'Money',
                'required' => false,
                'currency' => 'USD',
            ])
            ->add('percent', PercentType::class, [
                'label' => 'Percent',
                'required' => false,
            ])
            ->add('range', RangeType::class, [
                'label' => 'Range',
                'required' => false,
            ])

            ->add('date', DateType::class, [
                'label' => 'Date',
                'required' => false,
                'widget' => 'single_text',
            ])
            ->add('dateTime', DateTimeType::class, [
                'label' => 'Date and Time',
                'required' => false,
                'widget' => 'single_text',
            ])
            ->add('time', TimeType::class, [
                'label' => 'Time',
                'required' => false,
                'widget' => 'single_text',
            ])
            ->add('birthday', BirthdayType::class, [
                'label' => 'Birthday',
                'required' => false,
                'widget' => 'single_text',
            ])
            ->add('week', WeekType::class, [
                'label' => 'Week',
                'required' => false,
                'widget' => 'single_text',
            ])
            ->add('dateInterval', DateIntervalType::class, [
                'label' => 'Date Interval',
                'required' => false,
                'with_years' => true,
                'with_months' => true,
                'with_days' => true,
                'with_hours' => true,
            ])

            ->add('choiceSelect', ChoiceType::class, [
                'label' => 'Choice (Select)',
                'required' => false,
                'choices' => [
                    'Option 1' => 'option1',
                    'Option 2' => 'option2',
                    'Option 3' => 'option3',
                ],
            ])
            ->add('choiceRadio', ChoiceType::class, [
                'label' => 'Choice (Radio)',
                'required' => false,
                'expanded' => true,
                'multiple' => false,
                'choices' => [
                    'Option A' => 'a',
                    'Option B' => 'b',
                    'Option C' => 'c',
                ],
            ])
            ->add('choiceCheckboxes', ChoiceType::class, [
                'label' => 'Choice (Multiple Checkboxes)',
                'required' => false,
                'expanded' => true,
                'multiple' => true,
                'choices' => [
                    'Feature 1' => 'feature1',
                    'Feature 2' => 'feature2',
                    'Feature 3' => 'feature3',
                ],
            ])
            ->add('countrySelect', CountryType::class, [
                'label' => 'Country',
                'required' => false,
                'placeholder' => 'Choose a country',
            ])
            ->add('languageSelect', LanguageType::class, [
                'label' => 'Language',
                'required' => false,
                'placeholder' => 'Choose a language',
            ])
            ->add('localeSelect', LocaleType::class, [
                'label' => 'Locale',
                'required' => false,
                'placeholder' => 'Choose a locale',
            ])
            ->add('timezoneSelect', TimezoneType::class, [
                'label' => 'Timezone',
                'required' => false,
                'placeholder' => 'Choose a timezone',
            ])
            ->add('currencySelect', CurrencyType::class, [
                'label' => 'Currency',
                'required' => false,
                'placeholder' => 'Choose a currency',
            ])

            ->add('checkbox', CheckboxType::class, [
                'label' => 'Checkbox (Single)',
                'required' => false,
            ])

            ->add('file', FileType::class, [
                'label' => 'File Upload',
                'required' => false,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $optionsResolver): void
    {
        $optionsResolver->setDefaults([
        ]);
    }
}
