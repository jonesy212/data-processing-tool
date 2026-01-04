AnalysisNode.ts
Generic node representing analysis results

export interface AnalysisNode<
  T extends BaseDataEntity = BaseDataEntity
> {
  id: string;
  name: string;
  type: string; // entity, version, tag, milestone
  children?: AnalysisNode<T>[];
  metadata?: Record<string, any>;
  versionData?: VersionData<T> | Version<T>;
  tags?: Tag<T>[];
}
