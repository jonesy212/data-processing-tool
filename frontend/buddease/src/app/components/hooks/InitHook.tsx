// YourComponent.tsx
import generateDummyHook from './DummyGenerator';

const hookNames = [
  'useJobSearch',
  'useRecruiterDashboard',
  'useJobApplications',
  // Add more hook names as needed
];

const YourComponent = () => {
  const hooks = hookNames.reduce((acc, hookName) => {
    acc[hookName] = generateDummyHook(hookName).hook;
    return acc;
  }, {} as { [key: string]: any });

  return (
    <div>
      {hookNames.map((hookName) => (
        <div key={hookName}>
          <button onClick={hooks[hookName].toggleActivation}>
            Toggle {hookName}
          </button>
        </div>
      ))}
      {/* Your component content */}
    </div>
  );
};

export default YourComponent;
