.PHONY: help check fix phpstan cs-check cs-fix

# Default target
help:
	@echo "Available commands:"
	@echo "  make check     - Run all code quality checks (PHPStan + PHP-CS-Fixer dry-run)"
	@echo "  make fix       - Fix all fixable code quality issues"
	@echo "  make phpstan   - Run PHPStan analysis"
	@echo "  make cs-check  - Check code style with PHP-CS-Fixer (dry-run)"
	@echo "  make cs-fix    - Fix code style with PHP-CS-Fixer"

# Run all checks
check: phpstan cs-check

# Fix all fixable issues
fix: cs-fix

# Run PHPStan analysis
phpstan:
	@echo "Running PHPStan analysis..."
	./vendor/bin/phpstan analyse --configuration=phpstan.neon

# Check code style (dry-run)
cs-check:
	@echo "Checking code style with PHP-CS-Fixer..."
	./vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.php --dry-run --diff --verbose

# Fix code style
cs-fix:
	@echo "Fixing code style with PHP-CS-Fixer..."
	./vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.php --verbose