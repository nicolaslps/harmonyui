# HarmonyUI

> [!WARNING]
**About Development Activity**: While public commits may seem infrequent, this project is actively maintained and continuously developed in a production environment. We're working on performance improvements, stability enhancements, visual refinements, and new features to deliver high-quality components to the Symfony community in the next major release.

> [!WARNING]
> **NOT PRODUCTION READY** - This project is currently in active development and is **NOT** ready for production use. APIs are unstable, breaking changes will occur, and features may be incomplete. Use at your own risk. Do not use in production environments.

A comprehensive, Symfony-native component library that integrates seamlessly with your existing workflow.

## Why HarmonyUI?

HarmonyUI solves common frustrations in Symfony development:

- **Stop recreating the same components** - Reusable UI components for every project
- **Seamless JavaScript integration** - No complex setup or configuration
- **Consistent styling and behavior** - Unified design system across applications
- **Symfony-first approach** - Built specifically for the Symfony ecosystem
- **Accessibility by design** - WCAG compliant components out of the box
- **Developer experience focused** - Intuitive APIs and excellent DX

## Installation

### 1. Install via Composer

```bash
composer require harmonyui/ui-bundle
```

### 2. Add to package.json

Add this dependency to your `package.json`:

```json
"@harmonyui/primitives": "file:vendor/harmonyui/ui-bundle/assets"
```

### 3. Install dependencies

```bash
npm install
pnpm install
yarn install
...
```

### 4. Import JavaScript

Add to your app's JavaScript entry point:

```javascript
import '@harmonyui/primitives';
```

### 5. Configure CSS

Add this configuration to your CSS file:

```css
@source "path_to_your_project_root/vendor/harmonyui/ui-bundle/src/Resources/config/styles/**/*";
@custom-variant dark (&:is(.dark *));
@theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    /* ... other theme variables ... */
}
```

See the [installation guide](https://www.harmonyui.org/docs/overview/installation) for complete CSS configuration.

## Requirements

- PHP 8.2+
- Symfony 7.0+

## Development

### Code Quality Tools

```bash
# Run all quality checks
make check

# Individual tools
make stan       # PHPStan static analysis  
make cs-check   # PHP-CS-Fixer code style check
make cs         # PHP-CS-Fixer code style fix
make twig-check # Twig-CS-Fixer template check
make twig       # Twig-CS-Fixer template fix
make rector-dry # Rector preview changes
make rector     # Rector apply changes  
make test       # PHPUnit tests
```

### Docker Dev

At the root of the repository run :
```bash 
docker compose -f compose.dev.yml up -d --build
```

go to http://localhost:8080/


stop the container using : 
```bash
docker compose -f compose.dev.yml down -v
```

### Deploy to staging 

```bash
set -a
. ./.env.kamal
set +a
kamal deploy -d staging
```

### Deploy to prod 

```bash
set -a
. ./.env.kamal
set +a
kamal deploy
```
## License

MIT License - see [LICENSE](LICENSE) for details.