// AppVersion.test.ts
// Test file: src/app/core/versioning/__tests__/AppVersion.test.ts
import { AppVersionImpl } from '@/app/pages/_app';
import { BaseDataEntity } from '@/app/config/BaseConfig';

describe('AppVersion System with Generics', () => {
  test('should initialize with generic parameters', async () => {
    const version = new AppVersionImpl({
      appName: "Buddease",
      releaseDate: "2024-03-01",
      releaseNotes: ["Initial crypto integration"],
      major: 1,
      minor: 0,
      patch: 0
    });

    expect(version.getAppName()).toBe("Buddease");
    
    const structure = await version.frontendStructure;
    expect(structure.versions).toBeDefined();
    expect(structure.versions.backend).toBeUndefined();
    expect(structure.versions.frontend).toBeUndefined();
  });

  test('should handle generic entity analysis', async () => {
    interface TestEntity extends BaseDataEntity {
      id: string;
      name: string;
    }

    const version = new AppVersionImpl<TestEntity>({
      appName: "TestApp",
      releaseDate: "2024-01-01",
      releaseNotes: []
    });

    const structure = await version.frontendStructure;
    // Structure should be properly typed with TestEntity generic
    expect(structure).toHaveProperty('versions');
  });
});