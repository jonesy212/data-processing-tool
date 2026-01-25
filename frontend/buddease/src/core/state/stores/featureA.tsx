// featureA.tsx
import useAsyncHookLinker from "@/core/hooks/useAsyncHookLinker";
import { useFeatureContext } from "@/core/state/context/FeatureContext";
import React, { useEffect } from "react";
import useAsyncHookLinker from "@/core/hooks/useAsyncHookLinker";
const asyncEffectA = async (featureStore: any) => {
  // Example: add a feature asynchronously
  featureStore.addFeature("Feature A", "Automatically added by asyncEffectA");
};

const FeatureA: React.FC = () => {
  const { featureStore } = useFeatureContext();
  
    const { moveToNextHook, moveToPreviousHook } = useAsyncHookLinker({
      hooks: [],
    });

  const { moveToNextHook } = useAsyncHookLinker({
    hooks: [
      {
        condition: async () => true,
        asyncEffect: () => asyncEffectA(featureStore),
      },
    ],
  });

  useEffect(() => {
    moveToNextHook();
  }, [moveToNextHook]);

  return (
    <div>
      <h2>Feature A</h2>
      <ul>
        {featureStore.features.map((f) => (
          <li key={f.id}>{f.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FeatureA;
