.PHONY: help check fix stan cs-check cs test rector-dry rector

# Default target
help:
	@echo "Available commands:"
	@echo "  make check      - Run all code quality checks (PHPStan + PHP-CS-Fixer)"
	@echo "  make fix        - Fix all fixable code quality issues"
	@echo "  make stan       - Run PHPStan analysis"
	@echo "  make cs-check   - Check code style with PHP-CS-Fixer (dry-run)"
	@echo "  make cs         - Fix code style with PHP-CS-Fixer"
	@echo "  make test       - Run PHPUnit tests"
	@echo "  make rector-dry - Preview Rector changes (dry-run)"
	@echo "  make rector     - Apply Rector changes"

# Run all checks
check: stan cs-check rector-dry test

# Fix all fixable issues
fix: cs rector

# Run PHPStan analysis
stan:
	composer run stan

# Check code style (dry-run)
cs-check:
	composer run cs:check

# Fix code style
cs:
	composer run cs

# Run PHPUnit tests
test:
	composer run test

# Preview Rector changes
rector-dry:
	composer run rector:dry

# Apply Rector changes
rector:
	composer run rector:apply