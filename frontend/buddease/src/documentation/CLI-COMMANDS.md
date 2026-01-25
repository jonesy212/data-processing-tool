CLI Commands & Flags

| Flag                                         | Purpose
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `--deduplicate`                              | Run deduplication of imports across project                                                             |
| `--analyze-duplicates` / `--analyze-imports` | Analyze duplicate or problematic imports                                                                |
| `--import-stats` / `--stats`                 | Generate import statistics                                                                              |
| `--fix-interfaces`                           | Automatically fix interface import issues using `autoFixInterfaceImports(PROJECT_ROOT, allSourceFiles)` |
| `--fix`, `--fix-high`, `--fix-all`           | Auto-apply fixes with different confidence thresholds (default / high / all)                            |
| `--dry-run`                                  | Show what would be fixed without applying changes                                                       |
| `--safe`                                     | Safe mode for symbol-based fixes                                                                        |
| `--apply-rules`                              | Apply app-specific import/export rules                                                                  |
| `--list-rules`                               | List all app-specific rules                                                                             |
| `--rollback`                                 | Restore files from backup JSON record                                                                   |
