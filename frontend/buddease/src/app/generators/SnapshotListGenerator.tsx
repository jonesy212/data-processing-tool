import SnapshotList, { SnapshotItem } from "../components/snapshots/SnapshotList";

// SnapshotListGenerator.tsx
class SnapshotListGenerator {
    generateSnapshotList(rawData: any): SnapshotList {
      const snapshotList = new SnapshotList();
  
      // Logic to parse raw data and populate snapshot list
      // Example:
      rawData.forEach((data: any) => {
        const snapshotItem: SnapshotItem = {
          message: undefined,
          data: undefined,
          user: undefined,
          id: "",
          value: undefined,
          label: "",
          category: "",
          timestamp: "",
          updatedAt: undefined
        };
        snapshotList.addSnapshot(snapshotItem);
      });
  
      return snapshotList;
    }
  }
  export default SnapshotListGenerator;