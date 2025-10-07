# HarmonyUI Bundle

> **Note:** This is a read-only subtree split. No issues or pull requests will be accepted here. Please submit all contributions, bug reports, and feature requests at https://github.com/nicolaslps/HarmonyUI

> [!WARNING]
> **NOT PRODUCTION READY** - This project is currently in active development and is **NOT** ready for production use. APIs are unstable, breaking changes will occur, and features may be incomplete. Use at your own risk. Do not use in production environments.

Symfony bundle providing UI components with seamless JavaScript integration and modern styling.

## Installation

```bash
composer require harmonyui/ui-bundle
```

## Setup

### 1. Add JavaScript package

Add to your `package.json`:

```json
"@harmonyui/primitives": "file:vendor/harmonyui/ui-bundle/assets"
```

### 2. Install dependencies

```bash
npm install
pnpm install
yarn install
...
```

### 3. Import JavaScript

```javascript
import '@harmonyui/primitives';
```

### 4. Configure CSS

```css
@source "path_to_your_project_root/vendor/harmonyui/ui-bundle/src/Resources/config/styles/**/*";
@custom-variant dark (&:is(.dark *));
@theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    /* ... theme variables ... */
}
```

## Requirements

- PHP 8.2+
- Symfony 7.0+
- Twig 3.0+

## Development Status

⚠️ **Development Version** - APIs and functionality may change.

## License

MIT