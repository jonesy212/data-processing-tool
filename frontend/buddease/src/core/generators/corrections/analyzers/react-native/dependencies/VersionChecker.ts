VersionChecker.ts
export class VersionChecker {
  extractMajorVersion(version: string): number {
    const match = version.match(/[0-9]+/);
    return match ? parseInt(match[0]) : 0;
  }
}