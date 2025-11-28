// useComponentGenerator.ts
// client/useComponentGenerator.ts
import { useState } from 'react';

export function useComponentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateComponent = async (
    componentName: string,
    category?: string,
    properties?: any,
    brand?: any,
    nestedCategory?: string
  ) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentName,
          category,
          properties,
          brand,
          nestedCategory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate component');
      }

      const result = await response.json();
      return result.reactCode;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateComponent, isGenerating, error };
}