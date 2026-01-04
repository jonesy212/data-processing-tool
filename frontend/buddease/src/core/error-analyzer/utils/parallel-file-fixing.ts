parallel-file-fixing.ts
import pLimit from 'p-limit';

const limit = pLimit(4); // safe concurrency

await Promise.all(
  files.map(file =>
    limit(async () => {
      const { backupId } = await backupSystem.createBackup(
        file,
        'auto-fix-interface-imports',
        ['parallel']
      );

      try {
        await fixSingleFileImports(file);
      } catch (err) {
        await backupSystem.restoreBackup(backupId);
        throw err;
      }
    })
  )
);
