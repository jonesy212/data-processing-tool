// import { SnapshotItem } from "./SnapshotList";

// it('should sort snapshots by name in ascending order', () => {
//   const snapshotList = new SnapshotList<any>();
  
//     const snapshots: SnapshotItem<any>[] = [
//     { id: '1', name: 'Charlie' },
//     { id: '2', name: 'Alice' },
//     { id: '3', name: 'Bob' },
//   ];
//   snapshotList['snapshots'] = snapshots;

//   snapshotList['sortSnapshotsBy']('name');

//   expect(snapshotList['snapshots']).toEqual([
//     { id: '2', name: 'Alice' },
//     { id: '3', name: 'Bob' },
//     { id: '1', name: 'Charlie' },
//   ]);
// });


// it('should sort snapshots by name in descending order', () => {
//     const snapshotList = new SnapshotList<any>();
//     const snapshots: SnapshotItem<any>[] = [
//       { id: '1', name: 'Alice' },
//       { id: '2', name: 'Charlie' },
//       { id: '3', name: 'Bob' },
//     ];
//     snapshotList['snapshots'] = snapshots;
  
//     snapshotList['sortSnapshotsBy']('name');
//     snapshotList['snapshots'].reverse();
  
//     expect(snapshotList['snapshots']).toEqual([
//       { id: '2', name: 'Charlie' },
//       { id: '3', name: 'Bob' },
//       { id: '1', name: 'Alice' },
//     ]);
        
//   })
  
// it('should sort snapshots by creationDate in ascending order', () => {
//   const snapshotList = new SnapshotList<any>();
//   const snapshots: SnapshotItem<any>[] = [
//     { id: '1', creationDate: '2023-05-03' },
//     { id: '2', creationDate: '2023-05-01' },
//     { id: '3', creationDate: '2023-05-02' },
//   ];
//   snapshotList['snapshots'] = snapshots;

//   snapshotList['sortSnapshotsBy']('creationDate');

//   expect(snapshotList['snapshots']).toEqual([
//     { id: '2', creationDate: '2023-05-01' },
//     { id: '3', creationDate: '2023-05-02' },
//     { id: '1', creationDate: '2023-05-03' },
//   ]);
// });