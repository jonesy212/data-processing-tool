**<!-- SnapshotVersionManagment.md --->

# Snapshot Version Management Interfaces

## 📦 SnapshotVersionMethods - For Build/Deployment Systems

**Use Case:** A CI/CD pipeline that needs to validate version compatibility before deploying snapshots to different environments.

```typescript
// In your deployment script or CI/CD pipeline
const versionMethods: SnapshotVersionMethods = snapshot.getVersionMethods();

// ✅ Check backend compatibility before deployment
const backendVersion = await versionMethods.getBackendVersion();
if (backendVersion instanceof Promise) {
  const actualVersion = await backendVersion;
  console.log(`Deploying to backend version: ${actualVersion}`);
} else if (isIHydrateResult(backendVersion)) {
  console.log(`Hydrated version result: ${backendVersion.value}`);
  // Handle complex version hydration logic
}

// ✅ Verify frontend version matches backend requirements  
const frontendVersion = await versionMethods.getFrontendVersion();
if (frontendVersion && typeof frontendVersion === 'object') {
  // Handle IHydrateResult with additional metadata
  if (frontendVersion.metadata?.requiresBackendMinVersion) {
    // Enforce version compatibility rules
  }
}
Why complex return types? Because in deployment pipelines, you need:

IHydrateResult<number> - For complex version metadata (build timestamps, git hashes, dependency trees)

Promise<string> - For async version fetching from package.json or API endpoints

undefined - For environments where version isn't available (local development)

🔧 SnapshotUtilityMethods - For Application Logic
Use Case: A settings page that displays simple version information to users.

typescript
// In your React component or application code
const utilityMethods: SnapshotUtilityMethods<User, User> = snapshot.getUtilityMethods();

// ✅ Simple version display for UI
const backendVersion = await utilityMethods.getBackendVersion();
const frontendVersion = await utilityMethods.getFrontendVersion();

// Display in UI - no complex logic needed
<SettingsPanel>
  <VersionInfo 
    backend={backendVersion || 'Unknown'} 
    frontend={frontendVersion || 'Unknown'}
  />
</SettingsPanel>
Why simple return types? Because in application UI, you need:

Promise<string | number | undefined> - Simple values for display

Consistency - Always returns promises for async operations

No complex metadata - Users don't care about build details, just version numbers

When Would You Use Each?
Use SnapshotVersionMethods When:
🚀 Deploying to production - need build metadata

🔗 Checking version compatibility between services

📊 Analytics and monitoring - tracking which versions are running

🧪 Testing environments - complex version validation

Use SnapshotUtilityMethods When:
🖥️ Displaying versions in UI - simple user-facing information

🔧 Application configuration - basic version checks

📱 Client-side logic - simple conditional rendering based on version

🎨 User settings/preferences - basic version display

Architecture Diagram
text
Build System (CI/CD) → SnapshotVersionMethods → IHydrateResult | Promise<string>
    ↑
    | Handles complex deployment logic
    ↓
Application UI → SnapshotUtilityMethods → Promise<string|number>
The separation ensures that build system complexity doesn't leak into your application UI code, maintaining clean separation of concerns.**