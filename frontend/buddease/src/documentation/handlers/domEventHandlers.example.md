<!-- domEventHandlers.example.ts -->
### 🧩 Focus Management Examples

#### **Basic usage**
```tsx
<input 
  onFocus={handleFocus}
  onBlur={handleBlur}
/>
Container with focus management
tsx
Copy code
<div 
  onFocusIn={handleFocusIn}
  onFocusOut={handleFocusOut}
>
  <input />
  <button>Submit</button>
</div>
Custom composite handler
tsx
Copy code
const customFocusHandler = createFocusHandler({
  validate: true,
  autoSave: true,
  onFocus: (event) => console.log('Custom focus logic'),
  onBlur: (event) => console.log('Custom blur logic')
});

<input onFocus={customFocusHandler} onBlur={customFocusHandler} />
✅ Features Provided
🎨 Visual feedback with CSS classes

♿ Accessibility support (screen reader announcements)

✅ Form validation on blur

💾 Auto-save functionality

💬 Tooltip management

🔍 Search-specific behavior

🧠 Composite handlers for complex scenarios