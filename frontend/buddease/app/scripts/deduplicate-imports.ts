// deduplicate-imports.ts
import { runDeduplicationCLI } from '@/utils/import-deduplicator'

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runDeduplicationCLI(process.argv.slice(2));
}