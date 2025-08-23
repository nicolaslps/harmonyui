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