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

class DocSection
{
    private ?int $id = null;

    private ?string $title = null;

    private ?string $slug = null;

    private ?string $description = null;

    private ?int $sortOrder = null;

    /** @var DocPage[] */
    private array $pages = [];

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

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getSortOrder(): ?int
    {
        return $this->sortOrder;
    }

    public function setSortOrder(int $sortOrder): static
    {
        $this->sortOrder = $sortOrder;

        return $this;
    }

    /**
     * @return DocPage[]
     */
    public function getPages(): array
    {
        return $this->pages;
    }

    public function addPage(DocPage $docPage): static
    {
        if (!\in_array($docPage, $this->pages, true)) {
            $this->pages[] = $docPage;
            $docPage->setSection($this);
        }

        return $this;
    }

    public function removePage(DocPage $docPage): static
    {
        $key = array_search($docPage, $this->pages, true);
        if (false !== $key) {
            unset($this->pages[$key]);
            if ($docPage->getSection() === $this) {
                $docPage->setSection(null);
            }
        }

        return $this;
    }
}
