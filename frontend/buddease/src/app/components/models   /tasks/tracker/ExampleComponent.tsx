// // Example usage in a component
// import { useSelector } from 'react-redux';
// import { addTracker , selectTrackers} from '@/app/components/state/Slices/TrackerSlice';

// const ExampleComponent = () => {
//   const dispatch = useDispatch();
//   const trackers = useSelector(selectTrackers);

//   const addNewTracker = () => {
//     const newTracker: Tracker = {
//       name: 'New Tracker',
//       phases: ['Phase 1', 'Phase 2'],
//     };

//     dispatch(addTracker(newTracker));
//   };

//   return (
//     <div>
//       <button onClick={addNewTracker}>Add Tracker</button>
//       {trackers.map((tracker: any) => (
//         <div key={tracker.name}>
//           <h3>{tracker.name}</h3>
//           <p>Phases: {tracker.phases.join(', ')}</p>
//         </div>
//       ))}
//     </div>
//   );
// };
