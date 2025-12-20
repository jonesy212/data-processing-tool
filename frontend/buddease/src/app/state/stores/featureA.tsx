// FeatureA.tsx
import React, { useEffect } from "react";
import useAsyncHookLinker from "@/app/hooks/useAsyncHookLinker";
import { useFeatureContext } from "@/app/state/context/FeatureContext";

const asyncEffectA = async (featureStore: any) => {
  // Example: add a feature asynchronously
  featureStore.addFeature("Feature A", "Automatically added by asyncEffectA");
};

const FeatureA: React.FC = () => {
  const { featureStore } = useFeatureContext();

  const { moveToNextHook } = useAsyncHookLinker({
    hooks: [
      {
        condition: () => true,
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
