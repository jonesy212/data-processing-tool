isFileGitDirty
import { execSync } from 'child_process';

function isFileGitDirty(file: string): boolean {
  try {
    const result = execSync(`git status --porcelain "${file}"`).toString();
    return result.trim().length > 0;
  } catch {
    return true; // assume dirty if git fails
  }
}
