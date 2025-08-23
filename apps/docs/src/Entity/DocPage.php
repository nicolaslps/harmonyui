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

namespace App\Entity;

use App\Enum\PageType;

class DocPage
{
    private ?int $id = null;

    private ?string $title = null;

    private ?string $description = null;

    private ?string $slug = null;

    private PageType $pageType = PageType::PAGE;

    private bool $isPublished = false;

    private ?DocSection $docSection = null;

    private ?string $template = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    /**
     * Gets the section slug from the full slug (e.g., "components" from "components/button").
     */
    public function getSectionSlug(): ?string
    {
        if (null === $this->slug || '' === $this->slug || '0' === $this->slug) {
            return null;
        }

        $parts = explode('/', $this->slug);

        return 3 == \count($parts) ? $parts[1] : null;
    }

    /**
     * Gets the page slug from the full slug (e.g., "button" from "components/button").
     */
    public function getPageSlug(): ?string
    {
        if (null === $this->slug || '' === $this->slug || '0' === $this->slug) {
            return null;
        }

        $parts = explode('/', $this->slug);

        return 3 == \count($parts) ? $parts[2] : null;
    }

    public function getType(): PageType
    {
        return $this->pageType;
    }

    public function setType(PageType $pageType): static
    {
        $this->pageType = $pageType;

        return $this;
    }

    public function isPublished(): bool
    {
        return $this->isPublished;
    }

    public function setIsPublished(bool $isPublished): static
    {
        $this->isPublished = $isPublished;

        return $this;
    }

    public function getSection(): ?DocSection
    {
        return $this->docSection;
    }

    public function setSection(?DocSection $docSection): static
    {
        $this->docSection = $docSection;

        return $this;
    }

    public function getTemplate(): ?string
    {
        return $this->template;
    }

    public function setTemplate(?string $template): static
    {
        $this->template = $template;

        return $this;
    }
}
