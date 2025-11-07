// FeatureB.ts
import useAsyncHookLinker from "@/app/hooks/useAsyncHookLinker";

const asyncEffectB = async () => {
  // Asynchronous logic specific to Feature B
  console.log("Feature B async effect running");
  
  // Return cleanup function
  return () => {
    console.log("Feature B cleanup");
    // Cleanup logic here (clear timeouts, remove event listeners, etc.)
  };
};

const FeatureB = () => {
  const { moveToNextHook } = useAsyncHookLinker({
    hooks: [{ condition: async () => true, asyncEffect: asyncEffectB }],
  });

  return (
    // JSX and component logic for Feature B
    <div>Feature B Component</div>
  );
};

export default FeatureB;