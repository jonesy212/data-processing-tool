
// Define CustomPayload that extends Payload and aligns with CustomSnapshotData
type CustomPayload<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> = 
  Payload & // Ensure Payload contains common properties
  CustomSnapshotData<T, K, Meta>;

  