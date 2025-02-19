import { usePhaseMeta } from './usePhaseMeta';
import { waitForLoad } from './waitForLoad';

export const usePhaseWithLoad = <
    T extends BaseData<any>, 
    K extends T = T
>(
  area: string | undefined, 
  initialPhaseMetadata: Partial<StructuredMetadata<T, K>> = {}
) => {
  const { phaseMetadata, setPhaseMetadata, updatePhaseMetadata, phaseOptions, setPhaseOptions, updatePhaseOptions } = usePhaseMeta<T, K>(area, initialPhaseMetadata);

  useEffect(() => {
    (async () => {
      try {
        // Wait for page load
        await waitForLoad(() => document.readyState === 'complete');

        // Wait for element to exist
        const element = await waitForLoad(() => document.querySelector('#metadata-area'));

        // Wait for API data
        const data = await waitForLoad(async () => {
          const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
          const result = await response.json();
          return result;
        });

        updatePhaseMetadata({ customFields: data });
        console.log('Metadata updated for phase with area:', area);

      } catch (error) {
        console.error('Error loading metadata or elements:', error);
      }
    })();
  }, [area]);

  return { phaseMetadata, setPhaseMetadata, updatePhaseMetadata, phaseOptions, setPhaseOptions, updatePhaseOptions };
};
