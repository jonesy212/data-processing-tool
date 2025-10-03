// AccessDenied.tsx
// app/pages/Unauthorized.tsx
export default function Unauthorized() {
  return (
    <div className="unauthorized-page">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
    </div>
  );
}

// app/pages/AccessDenied.tsx  
export default function AccessDenied() {
  return (
    <div className="access-denied-page">
      <h1>Access Restricted</h1>
      <p>This area requires special permissions.</p>
    </div>
  );
}