# HarmonyUI

A modern component library for Symfony applications.

## Requirements

- PHP 8.4+
- Symfony 7.3+

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

## License

MIT License - see [LICENSE](LICENSE) for details.