<!-- MyAppWrapper.md -->
# 🧩 Key Classes / Interfaces You’ll Use Together

## **Core App & Routing**

### **`MyAppWrapper`**
Wraps your Next.js app, sets up:
- Hooks (`phaseHooks`)
- Utilities (`generateUtilityFunctions`)
- BrandingSettings
- Theme customization (via `useThemeCustomization`)
- ✅ **Needs `NotificationProvider` added here at the top level**

### **Next.js Entrypoints**

#### **`_app.tsx`** (uploaded)
- Defines `MyApp` component — root for pages  
- Should wrap everything with `NotificationProvider` (from `NotificationContext.tsx`)  
- Exports custom app logic to integrate global state, router, and stores  

#### **`index.tsx`**
- Bootstraps the user session, messaging system, and socket connections  
- Uses MobX `rootStores` hydration  
- ✅ Will receive notifications via the global provider  

### **Notification Layer**

#### **`NotificationContext`**
- Provides notification state and methods to React components  
- Depends on unified **`NotificationStore`**  
- ✅ Should wrap all app routes (top-level in `_app.tsx` or `MyAppWrapper`)  

#### **`NotificationStore`**
- Observable MobX store managing all notification logic  
- Used by `NotificationContext` and `ProjectStore`  
- ✅ Must be single instance app-wide (imported from `@/app/state/stores/NotificationStore`)  

#### **`NotificationData`**
- Generic interface used for notification items  
- Extends `Data` and `CalendarEvent`

---

## ⚙️ Supporting Layers

### **`ProjectStore`**
- Depends on `NotificationStore` (injected or defaulted)  
- Ties together task/milestone notifications  

### **`useMeta`**, **`StructuredMetadata`**, **`UnifiedMetadata`**
- Handle metadata association in `NotificationContext`  
- Plug seamlessly into your data layer (already compatible with your `VersionImpl` structure)  

### **`useThemeCustomization`**
- Supplies color, theme, and notification-related UI controls to `MyAppWrapper`  

### **`RootStores`**
- Manages global MobX state (including `NotificationStore`, `UserStore`, `ProjectStore`)  

---

## ✅ Integration Checklist

| Layer | Component / File | Integration Role | Notes |
|-------|-------------------|------------------|-------|
| 1️⃣ | `_app.tsx` | Root entry | Must wrap `<MyAppWrapper>` or `<Component>` with `<NotificationProvider>` |
| 2️⃣ | `MyAppWrapper.tsx` | Composition layer | Can either wrap `<MyApp>` in `<NotificationProvider>` or assume `_app.tsx` already does |
| 3️⃣ | `NotificationContext.tsx` | Context provider | Imports and manages global `NotificationStore` instance |
| 4️⃣ | `NotificationStore.ts` | Data store | Unified observable store for notifications (used in ProjectStore and UI) |
| 5️⃣ | `NotificationData` | Type interface | Used across stores, UI, and context for consistency |
| 6️⃣ | `ProjectStore.ts` | Domain logic | Uses same `NotificationStore` instance to trigger project-related notifications |
| 7️⃣ | `RootStores.ts` | Global store entry | Provides `notificationStore` singleton to all contexts |
| 8️⃣ | `index.tsx` | Initial page | Uses hydrated root stores; receives notification updates automatically |

---

## 🔁 Final Integration Flow

``` typescript
_app.tsx
 └── NotificationProvider
      └── MyAppWrapper
           ├── MyApp
           │     ├── Uses RootStores (includes NotificationStore)
           │     ├── Accesses NotificationContext via useContext()
           │     └── Sends notifications through store/context
           ├── CaptionManagementPage
           └── Other components
```