<!-- Normalized Base Hierarchy Diagram -->

BaseDataRoot
 └─ SharedIdentifiers<T, K>
 └─ SharedTimestamps
 └─ SharedStatusFlags
 └─ SharedMetadata<T, K, ExcludedFields>
       ├─ VersionMetadata<T, K> (Partial)
       ├─ StatusMetadata (Partial)
       ├─ ConfigMetadata (Partial)
       └─ SharedRelationshipData<K>

CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
 └─ Identifiable
 └─ UserOwned<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
 └─ Describable
 └─ Timestamped
 └─ Taggable<T>
 └─ DocumentContent
 └─ AccessControlled
 └─ CounterTrackable
 └─ SharedMetadata<T, K, ExcludedFields>
 └─ SharedIdentifiers<T, K>
 └─ SharedTimestamps
 └─ SharedStatusFlags

DataDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
 └─ CommonData<T, K, Meta>
 └─ Comments (Comment<T,K,Meta>[] | CustomComment)
 └─ Todos (Todo<T,K>[])
 └─ AnalysisData (Snapshots & DataAnalysisResult)
 └─ PhaseData, FakeData, Tags, Other Properties

SharedDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
 └─ SharedMetadata<T, K, ExcludedFields>
 └─ SharedIdentifiers<T, K>
 └─ Participants
 └─ Comments (Comment<T,K,Meta>[] | CustomComment)
 └─ Phase, PhaseName
 └─ UploadedAt
 └─ FakeData
 └─ Label
 └─ IsCompleted

Comment<T, K, Meta, Attachment, ExcludedFields>
 └─ BaseData<T, K, Meta, Attachment, ExcludedFields>
 └─ Optional properties:
      ├─ Text / Content
      ├─ Replies (Comment<T,K,Meta>[])
      ├─ Attachments
      ├─ Likes, Highlight, Tags, Author
      ├─ Pinned / Resolved / CustomProperty
      └─ PostId, Data

CustomComment
 └─ BlogComment
 └─ Optional Data / Custom Properties

SharedRelationshipData<K>
 └─ childIds?: K[]
 └─ relatedData?: K[]

SharedDashboardContentProps
 └─ OnlineStatus / ActiveCalls / Toggle Methods
