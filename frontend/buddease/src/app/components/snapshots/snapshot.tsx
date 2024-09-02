// // snapshot

import { Data } from "../models/data/Data";
import Version from "../versions/Version";
import {
  Snapshot
} from "./LocalStorageSnapshotStore";
import { CustomSnapshotData } from "./SnapshotData";
import { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
// // import { K, T , SnapshotConfig} from "./SnapshotConfig";




// // Define T as a generic type parameter
// function processSnapshot<T extends Data, K extends Data>(snapshot: Snapshot<T, K>) {
//   // Example usage of the Snapshot interface
//   const newSnapshot: Snapshot<T, K> = {
//     // ...snapshot,
//     transformDelegate, initializedState, getAllKeys, getAllItems, 
//     addDataStatus, removeData, updateData, updateDataTitle,
//     id: "snapshot1",
//     category: "example category",
//     timestamp: new Date(),
//     createdBy: "creator1",
//     description: "Sample snapshot description",
//     tags: ["sample", "snapshot"],
//     metadata: {},
//     data: new Map<string, Snapshot<T, K>>(),
//     initialState: null,
//     events: {
//       eventRecords: {},
//       callbacks: () => {
//         console.log("callbacks");
//         // Set callbacks here
//         return () => {
//           console.log("cleanup");
//           // Cleanup here
//         };
//       },
//     },
//     // Add all other required properties here
//     snapshotStoreConfig: snapshotStoreConfigInstance, // Add actual config
//     getSnapshotItems: () => [], // Replace with actual function
//     defaultSubscribeToSnapshots: () => {}, // Replace with actual function
//     transformSubscriber: (sub: Subscriber<T, K>

//     ) => {
//       // Transform subscriber here
//       return sub;
//     },
    
//     // Add other properties as needed
//   };

//   // Usage example
//   console.log(newSnapshot);
// }


// const plainDataObject: Record<string, Data> = {
//   "1": {
//     _id: "1",
//     id: "data1",
//     title: "Sample Data",
//     description: "Sample description",
//     timestamp: new Date(),
//     category: "Sample category",
//     scheduled: true,
//     status: "Pending",
//     notificationsEnabled: true,
//     isActive: true,
//     tags: {
//       "1": {
//         id: "1",
//         name: "Sample tag",
//         color: "#000000",
//         relatedTags: ["tag1", "tag2"],
//       }
//     },
//     phase: {
//       id: "phase1",
//       name: "Sample Phase",
//       description: "Sample description",
//       type: "Ideation",
//       status: "Pending",
//       tags: {
//         "1": {
//         id: "1",
//         name: "Sample tag",
//         color: "#000000",
//         relatedTags: ["Important"]
//         }
//       },

//       startDate: new Date(),
//       endDate: new Date(),
//       subPhases: [],
//       component: {} as React.FC<any>,
//       duration: 0,
//       hooks: {
//         onInit: () => { },
//         onMount: () => { },
//         onUnmount: () => { },
//         onPhaseChange: () => { },
//         onPhaseCompletion: () => { },
//         onPhaseCreation: () => { },
//         onPhaseDeletion: () => { },
//         onPhaseUpdate: () => { },
//         onPhaseMove: () => { },
//         onPhaseDueDateChange: () => { },
//         onPhasePriorityChange: () => { },
//         onPhaseAssigneeChange: () => { },

//         resetIdleTimeout: async () => { },
//         isActive: false,
//         progress: {
//           id: "",
//           value: 0,
//           label: "",
//           current: 0,
//           max: 0,
//           min: 0,
//           percentage: 0,
//           color: "",
//           name: "",
//           description: "",
//           done: false,
//         },
//         condition: async (idleTimeoutDuration: number) => {
//           return true;
//         },
//       },
//     },
//     phaseType: ProjectPhaseTypeEnum.Ideation,
//     dueDate: new Date(),
//     priority: "High",
//     assignee: {
//       id: "assignee1",
//       username: "Assignee Name",
//     } as User,
//     collaborators: ["collab1", "collab2"],
//     comments: [],
//     attachments: [],
//     subtasks: [],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     createdBy: "creator1",
//     updatedBy: "updater1",
//     analysisResults: [],
//     audioUrl: "sample-audio-url",
//     videoUrl: "sample-video-url",
//     videoThumbnail: "sample-thumbnail-url",
//     videoDuration: 60,
//     collaborationOptions: [],
//     videoData: {
//       id: "video1",
//       campaignId: 123,
//       resolution: "1080p",
//       size: "100MB",
//       aspectRatio: "16:9",
//       language: "en",
//       subtitles: [],
//       duration: 60,
//       createdBy: "John Doe",
//       codec: "H.264",
//       frameRate: 30,
//       url: "",
//       thumbnailUrl: "",
//       uploadedBy: "",
//       viewsCount: 0,
//       likesCount: 0,
//       dislikesCount: 0,
//       commentsCount: 0,
//       title: "",
//       description: "",
//       tags: [],
//       createdAt: new Date(),
//       uploadedAt: new Date(),
//       updatedAt: new Date(),
//       videoDislikes: 0,
//       videoAuthor: "",
//       videoDurationInSeconds: 60,
//       uploadDate: new Date(),
//       videoLikes: 20,
//       videoViews: 0,
//       videoComments: 0,
//       videoThumbnail: "",
//       videoUrl: "",
//       videoTitle: "",
//       thumbnail: "",
//       videoDescription: "",
//       videoTags: [],
//       videoSubtitles: [],
//       category: "",
//       closedCaptions: [],
//       license: "",
//       isLive: false,
//       isPrivate: false,
//       isUnlisted: false,
//       isProcessingCompleted: false,
//       isProcessingFailed: false,
//       isProcessingStarted: false,
//       channel: "",
//       channelId: "",
//       isLicensedContent: false,
//       isFamilyFriendly: false,
//       isEmbeddable: false,
//       isDownloadable: false,
//       playlists: [],
//       isDeleting: false,
//       isCompleted: false,
//       isUploading: false,
//       isDownloading: false,
//       isProcessing: false,
//     },
//     additionalData: {},
//     ideas: [],
//     members: [],
//     leader: {
//       id: "leader1",
//       username: "Leader Name",
//       email: "leader@example.com",
//       fullName: "Leader Full Name",
//       bio: "Leader Bio",
//       userType: "Admin",
//       hasQuota: true,
//       tier: "0",
//       token: "leader-token",
//       uploadQuota: 100,
//       usedQuota: 50,
//       avatarUrl: "avatar-url",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       isVerified: false,
//       isAdmin: false,
//       isActive: true,
//       profilePicture: null,
//       processingTasks: [],
//       role: UserRoles.TeamLeader,
//       firstName: "",
//       lastName: "",
//       friends: [],
//       blockedUsers: [],
//       persona: new Persona(PersonaTypeEnum.Default),
//       settings: {
//         id: "",
//         filter: (key: keyof Settings) => { },
//         appName: "buddease",
//         userId: 123,
//         userSettings: setTimeout(() => { }, 1000), // Example timeout
//         communicationMode: "email",
//         enableRealTimeUpdates: true,
//         defaultFileType: "pdf",
//         allowedFileTypes: ["pdf", "docx", "txt"],
//         enableGroupManagement: true,
//         enableTeamManagement: true,
//         idleTimeout: undefined,
//         startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
//           // Example implementation
//           setTimeout(onTimeout, timeoutDuration);
//         },
//         idleTimeoutDuration: 60000, // 1 minute
//         activePhase: "development",
//         realTimeChatEnabled: true,
//         todoManagementEnabled: true,
//         notificationEmailEnabled: true,
//         analyticsEnabled: true,
//         twoFactorAuthenticationEnabled: true,
//         projectManagementEnabled: true,
//         documentationSystemEnabled: true,
//         versionControlEnabled: true,
//         userProfilesEnabled: true,
//         accessControlEnabled: true,
//         taskManagementEnabled: true,
//         loggingAndNotificationsEnabled: true,
//         securityFeaturesEnabled: true,
//         collaborationPreference1: "Option 1",
//         collaborationPreference2: "Option 2",
//         theme: "light",
//         language: LanguageEnum.English, // Example language
//         fontSize: 14,
//         darkMode: false,
//         enableEmojis: true,
//         enableGIFs: true,
//         emailNotifications: true,
//         pushNotifications: true,
//         notificationSound: "ding.wav", // Example sound file
//         timeZone: "UTC",
//         dateFormat: "YYYY-MM-DD",
//         timeFormat: "HH:mm",
//         defaultProjectView: "list",
//         taskSortOrder: "priority",
//         showCompletedTasks: true,
//         projectColorScheme: "blue",
//         showTeamCalendar: true,
//         teamViewSettings: [],
//         defaultTeamDashboard: "overview",
//         passwordExpirationDays: 90,
//         privacySettings: [], // Example privacy settings
//         thirdPartyApiKeys: {
//           google: "your-google-api-key",
//           facebook: "your-facebook-api-key",
//         },
//         externalCalendarSync: true,
//         dataExportPreferences: [],
//         dashboardWidgets: [],
//         customTaskLabels: [],
//         customProjectCategories: [],
//         customTags: [],
//         additionalPreference1: "Option A",
//         additionalPreference2: "Option B",
//         formHandlingEnabled: true,
//         paginationEnabled: true,
//         modalManagementEnabled: true,
//         sortingEnabled: true,
//         notificationSoundEnabled: true,
//         localStorageEnabled: true,
//         clipboardInteractionEnabled: true,
//         deviceDetectionEnabled: true,
//         loadingSpinnerEnabled: true,
//         errorHandlingEnabled: true,
//         toastNotificationsEnabled: true,
//         datePickerEnabled: true,
//         themeSwitchingEnabled: true,
//         imageUploadingEnabled: true,
//         passwordStrengthEnabled: true,
//         browserHistoryEnabled: true,
//         geolocationEnabled: true,
//         webSocketsEnabled: true,
//         dragAndDropEnabled: true,
//         idleTimeoutEnabled: true,
//         enableAudioChat: true,
//         enableVideoChat: true,
//         enableFileSharing: true,
//         enableBlockchainCommunication: true,
//         enableDecentralizedStorage: true,
//         selectDatabaseVersion: "latest",
//         selectAppVersion: "2.0",
//         enableDatabaseEncryption: true,
//       },
//       interests: [],
//       privacySettings: {
//         hidePersonalInfo: true,
//         enablePrivacyMode: false,
//         enableTwoFactorAuth: true,
//         restrictVisibilityToContacts: false,
//         restrictFriendRequests: false,
//         hideOnlineStatus: false,
//         showLastSeenTimestamp: true,
//         allowTaggingInPosts: true,
//         enableLocationPrivacy: true,
//         hideVisitedProfiles: true,
//         restrictContentSharing: true,
//         enableIncognitoMode: false,
//         restrictContentSharingToContacts: false,
//         restrictContentSharingToGroups: false,
//       },
//       notifications: {
//         email: true,
//         push: true,
//         sms: false,
//         chat: false,
//         calendar: false,
//         task: false,
//         file: false,
//         meeting: false,
//         announcement: false,
//         reminder: false,
//         project: true,
//         enabled: true,
//         notificationType: "push",
//         audioCall: false,
//         videoCall: false,
//         screenShare: false,
//         mention: false,

//         reaction: true,
//         follow: true,
//         poke: true,
//         activity: false,

//         thread: false,
//         inviteAccepted: true,
//         directMessage: true,
//       },
//       activityLog: [
//         {
//           id: "",
//           activity: "",
//           action: "Logged in",
//           timestamp: new Date(),
//         },
//         {
//           id: "",
//           activity: "",
//           action: "Updated profile",
//           timestamp: new Date(),
//         },
//       ],
//       socialLinks: {
//         facebook: "https://facebook.com/leader",
//         twitter: "https://twitter.com/leader",
//         website: "https://website.com/leader",
//         linkedin: "https://linkedin.com/leader",
//         instagram: "https://finstagram.com/leader",
//       },
//       relationshipStatus: "Single",
//       hobbies: ["Reading", "Traveling"],
//       skills: ["Project Management", "Software Development"],
//       achievements: ["Completed 100 projects", "Employee of the Month"],
//       profileVisibility: "Public",
//       profileAccessControl: {
//         friendsOnly: true,
//         allowTagging: true,
//         blockList: [],
//         allowMessagesFromNonContacts: true,
//         shareProfileWithSearchEngines: false,
//         isPrivate: false,
//         isPrivateOnly: false,
//         isPrivateOnlyForContacts: false,
//         isPrivateOnlyForGroups: false,
//       },
//       activityStatus: "Online",
//       isAuthorized: true,
//       notificationPreferences: {
//         mobile: false,
//         desktop: true,
//         emailNotifications: true,
//         pushNotifications: true,
//         enableNotifications: true,
//         notificationSound: "birds",
//         notificationVolume: 50,
//         sms: false,
//       },
//       securitySettings: {
//         securityQuestions: ["What is your pet's name?"],
//         twoFactorAuthentication: false,
//         passwordPolicy: "StandardPolicy",
//         passwordExpirationDays: 90,
//         passwordStrength: "Strong",
//         passwordComplexityRequirements: {
//           minLength: 8,
//           requireUppercase: true,
//           requireLowercase: true,
//           requireDigits: true,
//           requireSpecialCharacters: false,
//         },
//         accountLockoutPolicy: {
//           enabled: true,
//           maxFailedAttempts: 5,
//           lockoutDurationMinutes: 15,
//         },
//         accountLockoutThreshold: 50, //todo create way reset threshod
//       },
//       emailVerificationStatus: true,
//       phoneVerificationStatus: true,
//       walletAddress: "0x123456789abcdef",
//       transactionHistory: [
//         createCustomTransaction({
//           id: "tx1",
//           amount: 100,
//           date: new Date(),
//           description: "Sample transaction",
//           type: null,
//           typeName: null,
//           to: null,
//           nonce: 0,
//           gasLimit: BigInt(0),
//           gasPrice: null,
//           maxPriorityFeePerGas: null,
//           maxFeePerGas: null,
//           data: "",
//           value: BigInt(0),
//           chainId: BigInt(0),
//           signature: null,
//           accessList: [],
//           maxFeePerBlobGas: null,
//           blobVersionedHashes: null,
//           hash: null,
//           unsignedHash: "",
//           from: null,
//           fromPublicKey: null,
//           isSigned(): boolean {
//             return !!(
//               this.type &&
//               this.typeName &&
//               this.from &&
//               this.signature
//             );
//           },
//           serialized: "",
//           unsignedSerialized: "",
//           inferType(): number {
//             if (this.type !== null && this.type !== undefined) {
//               return this.type;
//             }
//             return 0;
//           },
//           inferTypes(): number[] {
//             const types: number[] = [];
//             if (this.type !== null && this.type !== undefined) {
//               types.push(this.type);
//             }
//             if (this.maxFeePerGas !== null &&
//               this.maxPriorityFeePerGas !== null) {
//               types.push(2);
//             }
//             if (types.length === 0) {
//               types.push(0);
//             }
//             return types;
//           },
//           isLegacy() {
//             return this.type === 0 && this.gasPrice !== null;
//           },
//           isBerlin() {
//             return (
//               this.type === 1 &&
//               this.gasPrice !== null &&
//               this.accessList !== null
//             );
//           },
//           isLondon() {
//             return (
//               this.type === 2 &&
//               this.accessList !== null &&
//               this.maxFeePerGas !== null &&
//               this.maxPriorityFeePerGas !== null
//             );
//           },
//           isCancun() {
//             return (
//               this.type === 3 &&
//               this.to !== null &&
//               this.accessList !== null &&
//               this.maxFeePerGas !== null &&
//               this.maxPriorityFeePerGas !== null &&
//               this.maxFeePerBlobGas !== null &&
//               this.blobVersionedHashes !== null
//             );
//           },
//           clone(): CustomTransaction {
//             const clonedData: CustomTransaction = {
//               _id: this._id as string,
//               id: this.id as string,
//               amount: this.amount,
//               date: this.date as Date,
//               title: this.title as string,
//               value: this.value as bigint,
//               description: this.description || "",
//               startDate: this.startDate ? new Date(this.startDate) : undefined,
//               endDate: this.endDate ? new Date(this.endDate) : undefined,
//               isSigned: typeof this.isSigned === "function"
//                 ? this.isSigned.bind(this)
//                 : this.isSigned,
//               serialized: this.serialized,
//               unsignedSerialized: this.unsignedSerialized,
//               nonce: this.nonce as number,
//               gasLimit: this.gasLimit as bigint,
//               chainId: this.chainId,
//               hash: this.hash,
//               type: this.type as number,
//               typeName: this.typeName || "",
//               data: this.data || "",
//               unsignedHash: this.unsignedHash || "",
//               to: this.to,
//               gasPrice: this.gasPrice as bigint,
//               maxFeePerGas: this.maxFeePerGas as bigint,
//               maxPriorityFeePerGas: this.maxPriorityFeePerGas as bigint,
//               signature: this.signature as Signature,
//               accessList: this.accessList,
//               maxFeePerBlobGas: this.maxFeePerBlobGas as bigint,
//               blobVersionedHashes: this.blobVersionedHashes as string,
//               from: this.from as string,
//               fromPublicKey: this.fromPublicKey,
//               isLegacy: typeof this.isLegacy === "function"
//                 ? this.isLegacy.bind(this)
//                 : this.isLegacy,
//               isBerlin: typeof this.isBerlin === "function"
//                 ? this.isBerlin.bind(this)
//                 : this.isBerlin,
//               isLondon: typeof this.isLondon === "function"
//                 ? this.isLondon.bind(this)
//                 : this.isLondon,
//               isCancun: typeof this.isCancun === "function"
//                 ? this.isCancun.bind(this)
//                 : this.isCancun,
//               inferType: typeof this.inferType === "function"
//                 ? this.inferType.bind(this)
//                 : this.inferType,
//               inferTypes: typeof this.inferTypes === "function"
//                 ? this.inferTypes.bind(this)
//                 : this.inferTypes,
//               clone: typeof this.clone === "function" ? this.clone : this.clone,

//               equals: function (
//                 this: CustomTransaction,
//                 data: CustomTransaction
//               ): boolean {
//                 return (
//                   this.id === data.id &&
//                   this._id === data._id &&
//                   this.title === data.title &&
//                   this.amount === data.amount &&
//                   this.date?.getTime() === data.date?.getTime() &&
//                   this.description === data.description &&
//                   this.startDate?.getTime() === data.startDate?.getTime() &&
//                   this.endDate?.getTime() === data.endDate?.getTime() &&
//                   this.serialized === data.serialized &&
//                   this.unsignedSerialized === data.unsignedSerialized &&
//                   this.accessList === data.accessList &&
//                   this.to === data.to &&
//                   this.nonce === data.nonce &&
//                   this.gasLimit === data.gasLimit &&
//                   this.gasPrice === data.gasPrice &&
//                   this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
//                   this.maxFeePerGas === data.maxFeePerGas &&
//                   this.type === data.type &&
//                   this.data === data.data &&
//                   this.value === data.value &&
//                   this.chainId === data.chainId &&
//                   this.signature === data.signature &&
//                   this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
//                   this.blobVersionedHashes === data.blobVersionedHashes &&
//                   this.hash === data.hash &&
//                   this.unsignedHash === data.unsignedHash &&
//                   this.from === data.from &&
//                   this.fromPublicKey === data.fromPublicKey
//                   //if ther eare any new props ensure to add && above after the ast value
//                   // Check other properties as needed
//                   // Add checks for other properties here
//                 );
//               },
//               getSubscriptionLevel: function (this: CustomTransaction) {
//                 return "Pro";
//               },
//               getRecentActivity: function (this: CustomTransaction) {
//                 return [
//                   { action: "Created snapshot", timestamp: new Date() },
//                   { action: "Edited snapshot", timestamp: new Date() },
//                 ];
//               },
//               notificationsEnabled: true,
//               recentActivity: [
//                 { action: "Created snapshot", timestamp: new Date() },
//                 { action: "Edited snapshot", timestamp: new Date() },
//               ],
//             };
//             return clonedData;
//           },
//           equals(data: CustomTransaction) {
//             const isSigned = typeof this.isSigned === "function"
//               ? this.isSigned()
//               : this.isSigned;
//             const dataIsSigned = typeof data.isSigned === "function"
//               ? data.isSigned()
//               : data.isSigned;
//             const isCancun = typeof this.isCancun === "function"
//               ? this.isCancun()
//               : this.isCancun;
//             const dataIsCancun = typeof data.isCancun === "function"
//               ? data.isCancun()
//               : data.isCancun;
//             const isLegacy = typeof this.isLegacy === "function"
//               ? this.isLegacy()
//               : this.isLegacy;
//             const dataIsLegacy = typeof data.isLegacy === "function"
//               ? data.isLegacy()
//               : data.isLegacy;
//             const isBerlin = typeof this.isBerlin === "function"
//               ? this.isBerlin()
//               : this.isBerlin;
//             const dataIsBerlin = typeof data.isBerlin === "function"
//               ? data.isBerlin()
//               : data.isBerlin;
//             const isLondon = typeof this.isLondon === "function"
//               ? this.isLondon()
//               : this.isLondon;
//             const dataIsLondon = typeof data.isLondon === "function"
//               ? data.isLondon()
//               : data.isLondon;

//             return (
//               this.id === data.id &&
//               this.amount === data.amount &&
//               this.date?.getTime() === data.date?.getTime() &&
//               this.description === data.description &&
//               this.nonce === data.nonce &&
//               this.gasLimit === data.gasLimit &&
//               this.gasPrice === data.gasPrice &&
//               this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
//               this.maxFeePerGas === data.maxFeePerGas &&
//               this.data === data.data &&
//               this.value === data.value &&
//               this.chainId === data.chainId &&
//               this.from === data.from &&
//               this.fromPublicKey === data.fromPublicKey &&
//               this.to === data.to &&
//               this.type === data.type &&
//               this.typeName === data.typeName &&
//               this.serialized === data.serialized &&
//               this.unsignedSerialized === data.unsignedSerialized &&
//               this.accessList?.length === data.accessList?.length &&
//               this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
//               this.blobVersionedHashes === data.blobVersionedHashes &&
//               (isSigned ?? false) === (dataIsSigned ?? false) &&
//               (isCancun ?? false) === (dataIsCancun ?? false) &&
//               (isLegacy ?? false) === (dataIsLegacy ?? false) &&
//               (isBerlin ?? false) === (dataIsBerlin ?? false) &&
//               (isLondon ?? false) === (dataIsLondon ?? false)
//             );
//           },
//           recentActivity: [
//             {
//               action: "Logged in",
//               timestamp: new Date(),
//             },
//             {
//               action: "Updated profile",
//               timestamp: new Date(),
//             },
//           ],
//         }),
//       ],
//     },
//   },
// }





// const config = {
//   id: "snapshot1",
//   category: "example category",
//   timestamp: new Date(),
//   createdBy: "creator1",
//   description: "Sample snapshot description",
//   tags: ["sample", "snapshot"],
//   metadata: {},
//   data: {
//     id: "data1",
//     title: "Data Title",
//     // Add other BaseData properties if needed
//   },
//   initialState: undefined,
//   meta: new Map<string, Snapshot<BaseData, BaseData>>(),
//   events: {
//     eventRecords: [
//      {
//         action: "Created snapshot",
//         timestamp: new Date(),
//         id: "",
//         title: "",
//         // Add other BaseData properties if needed
//       },
//       {
//         action: "Updated snapshot",
//         timestamp: new Date(),
//         id: "",
//         title: "",
//         // Add other BaseData properties if needed
//       },
//     ],
//   },
//   equals: function (data: Snapshot<BaseData, BaseData>) {
//     return (
//       this.id === data.id &&
//       this.category === data.category &&
//       (this.timestamp instanceof Date && data.timestamp instanceof Date
//         ? this.timestamp.getTime() === data.timestamp.getTime()
//         : this.timestamp === data.timestamp) &&
//       this.createdBy === data.createdBy &&
//       this.description === data.description &&
//       this.tags.length === (data.tags?.length ?? 0) &&
//       this.metadata === data.metadata &&

//       ('id' in this.data && data.data && 'id' in data.data ? this.data.id === data.data.id : true) &&
//       ('title' in this.data && data.data && 'title' in data.data ? this.data.title === data.data.title : true) &&
//       this.initialState === data.initialState &&

//       this.meta.size === (data.meta?.size ?? 0) &&

//       (this.events && data.events &&
//       'eventRecords' in this.events && 'eventRecords' in data.events &&
//       Array.isArray(this.events.eventRecords) && Array.isArray(data.events.eventRecords) &&
//       this.events.eventRecords.length === data.events.eventRecords.length &&
//       this.events.eventRecords.every((record, index) => {
//         const dataRecord = data.events.eventRecords[index];
//         return (
//           record.action === dataRecord.action &&
//           (record.timestamp instanceof Date && dataRecord.timestamp instanceof Date
//             ? record.timestamp.getTime() === dataRecord.timestamp.getTime()
//             : record.timestamp === dataRecord.timestamp)
//         );
//       }))
//     );
//   },
//   recentActivity: [
//     {
//       action: "Logged in",
//       timestamp: new Date(),
//     },
//     {
//       action: "Updated profile",
//       timestamp: new Date(),
//     },
//     {
//       action: "Created snapshot",
//       timestamp: new Date(),
//     },
//     {
//       action: "Updated snapshot",
//       timestamp: new Date(),
//     },
//     {
//       action: "Logged out",
//       timestamp: new Date(),
//     }
//   ],
// } as const;
// async function createDataObject(
//   plainDataObject: Record<string, BaseData>,
//   baseData: BaseData,
//   baseMeta: Map<string, Snapshot<BaseData, BaseData>>
// ): Promise<Map<string, Snapshot<BaseData, BaseData>>> {
//   // Create an array of promises for the snapshot creation
//   const snapshotPromises = Object.entries(plainDataObject).map(
//     async ([key, value]) => {
//       const snapshot = await createBaseSnapshot(baseData, baseMeta);
//       return [key, snapshot.data] as [string, Snapshot<BaseData, BaseData>];
//     }
//   );

//   // Wait for all promises to resolve
//   const resolvedEntries = await Promise.all(snapshotPromises);

//   // Create a Map from the resolved entries
//   return new Map<string, Snapshot<BaseData, BaseData>>(resolvedEntries);
// }

// // Usage example
// createDataObject(plainDataObject, baseData, baseMeta).then((dataObject) => {
//   console.log(dataObject);
// });


// const snapshot: Snapshot<BaseData, BaseData> = {
//   id: "snapshot1",
//   category: "example category",
//   timestamp: new Date(),
//   createdBy: "creator1",
//   description: "Sample snapshot description",
//   tags: {},
//   metadata: {},
//   data: {
//     id: "data1",
//     title: "Data Title",
//     // Add other BaseData properties if needed
//   },
//   initialState: undefined,
//   meta: new Map<string, Snapshot<BaseData, BaseData>>(),
//   events: {
//     eventRecords: [
//      {
//         action: "Created snapshot",
//         timestamp: new Date(),
//         id: "",
//         title: "",
//         content: "",
//         topics: [],
//         highlights: [],
//         files: [],
//         date: undefined,
//         meta: undefined,
//         rsvpStatus: "yes",
//         participants: [],
//         teamMemberId: "",
//         getSnapshotStoreData: (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData, K>, SnapshotWithCriteria<BaseData, K>>[]> => {
//           throw new Error("Function not implemented.");
//         },
//         getData: getData()
//       },
//       {
//         action: "Edited snapshot",
//         timestamp: new Date(),
//         id: "",
//         title: "",
//         content: "",
//         topics: [],
//         highlights: [],
//         files: [],
//         date: undefined,
//         meta: undefined,
//         rsvpStatus: "yes",
//         participants: [],
//         teamMemberId: "",
//         getSnapshotStoreData: function (): Promise<SnapshotStore<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
//           throw new Error("Function not implemented.");
//         },
//         getData: function (): Promise<Snapshot<SnapshotWithCriteria<BaseData>, SnapshotWithCriteria<BaseData>>[]> {
//           throw new Error("Function not implemented.");
//         }
//       },
//     ],
//   },
//   getSnapshotId: (key: string | SnapshotData<BaseData, BaseData>): unknown => {
//     if (typeof key === "string") {
//       return key;
//     } else {
//       return key._id;
//     }
//   },

//   compareSnapshotState: function (snapshot: Snapshot<BaseData, BaseData> | null, state: any): boolean {
//     if (!snapshot || !snapshot.timestamp || !snapshot.tags || !snapshot.data) {
//       return false;
//     }
//     // Implement specific comparison logic based on the properties of snapshot and state
//     return (
//       snapshot.id === state.id &&
//       snapshot.category === state.category &&
//       snapshot.timestamp === new Date(state.timestamp).getTime() &&
//       snapshot.createdBy === state.createdBy &&
//       snapshot.description === state.description &&
//       snapshot.tags.join(",") === state.tags.join(",") &&
//       JSON.stringify(snapshot.metadata) === JSON.stringify(state.metadata) &&
//       ('id' in snapshot.data && 'id' in state.data && snapshot.data.id === state.data.id) &&
//       ('title' in snapshot.data && 'title' in state.data && snapshot.data.title === state.data.title)
//       // Add other property comparisons as needed
//     );
//   },
//   eventRecords: null,
//   snapshotStore: null,
//   getParentId: function (): string | null {
//     return this.parentId || null;
//   },
//   getChildIds: function (): string[] {
//     return this.metadata.childIds || [];
//   },
//   addChild: function (childSnapshot: Snapshot<BaseData, BaseData>): void {
//     if (!this.metadata.childIds) {
//       this.metadata.childIds = [];
//     }
//     this.metadata.childIds.push(childSnapshot.id);
//     // Ensure the child snapshot has the current snapshot as its parent
//     childSnapshot.metadata.parentId = this.id;
//   },
//   removeChild: function (childSnapshot: Snapshot<BaseData, BaseData>): void {
//     if (!this.metadata.childIds) {
//       return;
//     }
//     this.metadata.childIds = this.metadata.childIds.filter((id: string) => id !== childSnapshot.id);
//     // Remove the current snapshot as the parent of the child snapshot
//     childSnapshot.metadata.parentId = null;
//   },
//   getChildren: function (): Snapshot<BaseData, BaseData>[] {
//     return this.metadata.childIds
//       ? this.metadata.childIds.map((id: string) => dataObject.get(id))
//       : [];
//   },
//   hasChildren: function (): boolean {
//     return this.metadata.childIds && this.metadata.childIds.length > 0;
//   },
//   isDescendantOf: function (parentSnapshot: Snapshot<BaseData, BaseData>,
//     childSnapshot: Snapshot<BaseData, BaseData>

//   ): boolean {
//     const childIds = this.getChildIds(childSnapshot);
//     if (Array.isArray(childIds)) {
//       return childIds.includes(parentSnapshot.id);
//     }
//     return false;
//   },
//   dataItems: null,
//   newData: null,
//   stores: null,
//   getStore: function (
//     storeId: number,
//     snapshotStore: SnapshotStore<BaseData, BaseData>,
//     snapshotId: string,
//     snapshot: Snapshot<BaseData, BaseData>,
//     type: string,
//     event: Event
//   ): SnapshotStore<BaseData, BaseData> | null {
//       return new SnapshotStore<BaseData, BaseData>(storeId, options, config, operation);
//   },
//   addStore: function (
//     storeId: number,
//     snapshotStore: SnapshotStore<BaseData, BaseData>,
//     snapshotId: string,
//     snapshot: Snapshot<BaseData, BaseData>,
//     type: string,
//     event: Event
//   ): SnapshotStore<BaseData, BaseData> | null {
//     if (!this.stores) {
//       this.stores = [];
//     }
//     // verify if store is already added
//     if (this.stores[storeId]) {
//       return null;
//     }
//     this.stores[storeId] = snapshotStore;
//     return snapshotStore;
//   },

//   mapSnapshot: function (
//     storeId: number,
//     snapshotStore: SnapshotStore<BaseData, BaseData>,
//     snapshotId: string,
//     snapshot: Snapshot<BaseData, BaseData>,
//     type: string,
//     event: Event,
//     subscribers?: SubscriberCollection<BaseData, BaseData>,
//   ): Snapshot<BaseData, BaseData> | null {
//     if (!this.stores) {
//       this.stores = [];
//     }
  
//     // Verify if store is already added
//     if (!this.stores[storeId]) {
//       this.stores[storeId] = snapshotStore;
//     }
  
//     const store = this.stores[storeId];
  
//     // Verify if store is already removed
//     if (!store) {
//       console.warn(`Store with ID ${storeId} does not exist.`);
//       return snapshot;
//     }
  
//     switch (type) {
//       case 'add':
//         store.addSnapshot(
//           snapshot,
//           snapshotId,
//           subscribers
//         );
//         break;
//       case 'remove':
//         store.removeSnapshot(snapshotId);
//         break;
//       case 'update':
//         store.updateSnapshot(snapshotId, snapshot);
//         break;
//       default:
//         console.warn(`Unsupported type: ${type}`);
//     }
  
//     console.log(`Handled snapshot with ID: ${snapshotId} for store ID: ${storeId} with event type: ${type}`, event);
  
//     return snapshot;
//   },
//   removeStore: function (
//     storeId: number,
//     store: SnapshotStore<BaseData, BaseData>,
//     snapshotId: string,
//     snapshot: Snapshot<BaseData, BaseData>,
//     type: string,
//     event: Event
//   ): void {
//     throw new Error("Function not implemented.");
//   },
//   unsubscribe: function (
//     callback: Callback<Snapshot<BaseData, BaseData>>)
//     : void {
//     throw new Error("Function not implemented.");
//   },
//   addSnapshotFailure: function (
//     snapshotManager: SnapshotManager<BaseData, BaseData>,
//     snapshot: Snapshot<BaseData, BaseData>,
//     payload: { error: Error; }): void {
//     throw new Error("Function not implemented.");
//   },
//   configureSnapshotStore: function (
//     snapshotStore: SnapshotStore<BaseData, BaseData>,
//     snapshotId: string,
//     data: Map<string, Snapshot<BaseData, BaseData>>,
//     events: Record<string, CalendarEvent<BaseData, BaseData>[]>,
//     dataItems: RealtimeDataItem[],
//     newData: Snapshot<BaseData, BaseData>,
//     payload: ConfigureSnapshotStorePayload<BaseData>,
//     store: SnapshotStore<any, BaseData>,
//     callback: (snapshotStore: SnapshotStore<BaseData, BaseData>

//     ) => void): void | null {
//     throw new Error("Function not implemented.");
//   },
//   updateSnapshotSuccess: function (
//     snapshotId: string,
//     snapshotManager: SnapshotManager<BaseData, BaseData>,
//     snapshot: Snapshot<BaseData, BaseData>,
//     payload: { error: Error; }
//   ): void | null {
//     throw new Error("Function not implemented.");
//   },
//   createSnapshotFailure: function (
//     snapshotId: string,
//     snapshotManager: SnapshotManager<BaseData, BaseData>,
//     snapshot: Snapshot<BaseData, BaseData>,
//     payload: { error: Error; }
//   ): Promise<void> {
//     throw new Error("Function not implemented.");
//   },
//   createSnapshotStores: function (id: string, snapshotId: string,
//     snapshot: Snapshot<BaseData, BaseData>,
//     napshotStore: SnapshotStore<BaseData, BaseData>,
//     snapshotManager: SnapshotManager<BaseData, BaseData>,
//     payload: CreateSnapshotStoresPayload<BaseData, BaseData>,
//     callback: (
//       snapshotStore: SnapshotStore<BaseData, BaseData>[]
//     ) => void | null,
//     snapshotStoreData?: SnapshotStore<BaseData, BaseData>[] | undefined, category?: string | CategoryProperties, snapshotDataConfig?: SnapshotStoreConfig<BaseData, BaseData>[] | undefined): SnapshotStore<BaseData, BaseData>[] | null {
//     throw new Error("Function not implemented.");
//   },
//   handleSnapshot: function (
//     id: string,
//     snapshotId: string,
//     snapshot: Data | null,
//     snapshotData: Data,
//     category: symbol | string | Category | undefined,
//     callback: (snapshot: Data) => void,
//     snapshots: SnapshotsArray<Data>,
//     type: string,
//     event: Event,
//     snapshotContainer?: Data,
//     snapshotStoreConfig?: SnapshotStoreConfig<Data, K>,
//   ): Promise<Snapshot<Data, K> | null> {

//     return new Promise((resolve, reject) => {
//       // Check if the snapshot is null
//       if (snapshot === null) {
//         reject("Snapshot is null");
//       }

//       const { handleError } = useErrorHandling(); // Access handleError function from useErrorHandling
  
//       // Check if the snapshot is null
//       if (snapshot === null) {
//         handleError("Snapshot is null");
//         return null; // Return null if snapshot is not available
//       }
  
//       // Determine if the snapshot exists in the snapshot array
//       const existingSnapshot = snapshots.find(s => s.id === snapshotId);
    
//       if (existingSnapshot) {
//         // Update the existing snapshot
//         existingSnapshot.data = snapshotData;
//         existingSnapshot.category = category;
//         existingSnapshot.timestamp = new Date(); // Update the timestamp to the current time
  
//         // Trigger the callback function with the updated snapshot
//         callback(existingSnapshot.data);
  
//         // Handle event if necessary
//         if (event) {
//           event.emit('snapshotUpdated', existingSnapshot);
//         }
  
//         // If using snapshot store configuration, handle the snapshot store update
//         if (snapshotStoreConfig) {
//           // Example: Update the snapshot store based on the configuration
//           // This is a placeholder; adjust according to your actual snapshot store logic
//           const snapshotStore = snapshotStoreConfig.getSnapshotStore();
//           if (snapshotStore) {
//             snapshotStore.addSnapshot(existingSnapshot);
//           }
//         }
  
//         resolve(existingSnapshot); // Return the updated snapshot
//       } else {
//         // Create a new snapshot if it does not exist
//         const newSnapshot: Snapshot<Data, K> = {
//           id: snapshotId,
//           data: snapshotData,
//           category: category,
//           timestamp: new Date(), // Set the timestamp to the current time
//           // Include other necessary properties and metadata
//         };
  
//         // Add the new snapshot to the snapshots array
//         snapshots.push(newSnapshot);
  
//         // Trigger the callback function with the new snapshot data
//         callback(newSnapshot.data);
  
//         // Handle event if necessary
//         if (event) {
//           event.emit('snapshotCreated', newSnapshot);
//         }
  
//         // If using snapshot store configuration, handle the snapshot store update
//         if (snapshotStoreConfig) {
//           // Example: Add the new snapshot to the snapshot store
//           // This is a placeholder; adjust according to your actual snapshot store logic
//           const snapshotStore = snapshotStoreConfig.getSnapshotStore();
//           if (snapshotStore) {
//             snapshotStore.addSnapshot(newSnapshot);
//           }
//         }
  
//         // Return the newly created snapshot
//         return newSnapshot;
//       }
//     })
//   }
// };


// // const sampleSnapshot: Snapshot<BaseData, any> = {
// //   timestamp: new Date().toISOString() ?? "",
// //   value: "42",
// //   category: "sample snapshot",
// //   snapshotStoreConfig: {} as SnapshotStoreConfig<BaseData, any>,
// //   getSnapshotItems: function (): (SnapshotStoreConfig<BaseData, any> | SnapshotItem<BaseData, any>)[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   defaultSubscribeToSnapshots: function (snapshotId: string, callback: (snapshots: Snapshots<BaseData>) => Subscriber<BaseData, any> | null, snapshot?: Snapshot<BaseData, any> | null | undefined): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   versionInfo: null,
// //   transformSubscriber: function (sub: Subscriber<BaseData, any>): Subscriber<BaseData, any> {
// //     throw new Error("Function not implemented.");
// //   },
// //   transformDelegate: function (): SnapshotStoreConfig<BaseData, any>[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   initializedState: undefined,
// //   getAllKeys: function (): Promise<string[]> | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   getAllItems: function (): Promise<Snapshot<BaseData, any>[]> | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   addDataStatus: function (id: number, status: "completed" | "pending" | "inProgress"): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeData: function (id: number): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateData: function (id: number, newData: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateDataTitle: function (id: number, title: string): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateDataDescription: function (id: number, description: string): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateDataStatus: function (id: number, status: "completed" | "pending" | "inProgress"): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addDataSuccess: function (payload: { data: Snapshot<BaseData, any>[]; }): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getDataVersions: function (id: number): Promise<Snapshot<BaseData, any>[] | undefined> {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateDataVersions: function (id: number, versions: Snapshot<BaseData, any>[]): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getBackendVersion: function (): Promise<string | undefined> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getFrontendVersion: function (): Promise<string | IHydrateResult<number>> {
// //     throw new Error("Function not implemented.");
// //   },
// //   fetchData: function (id: number): Promise<SnapshotStore<BaseData, any>[]> {
// //     throw new Error("Function not implemented.");
// //   },
// //   defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, any>>, snapshot: Snapshot<BaseData, any>): string {
// //     throw new Error("Function not implemented.");
// //   },
// //   handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, any>>, snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeItem: function (key: string): Promise<void> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<BaseData, any>; snapshotStore: SnapshotStore<BaseData, any>; data: BaseData; }> | undefined): Promise<Snapshot<BaseData, any>> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSnapshotSuccess: function (snapshot: Snapshot<BaseData, any>): Promise<SnapshotStore<BaseData, any>> {
// //     throw new Error("Function not implemented.");
// //   },
// //   setItem: function (key: string, value: BaseData): Promise<void> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getDataStore: {},
// //   addSnapshotSuccess: function (snapshot: BaseData, subscribers: Subscriber<BaseData, any>[]): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   deepCompare: function (objA: any, objB: any): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   shallowCompare: function (objA: any, objB: any): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   getDataStoreMethods: function (): DataStoreMethods<BaseData, any> {
// //     throw new Error("Function not implemented.");
// //   },
// //   getDelegate: function (snapshotStoreConfig: SnapshotStoreConfig<BaseData, any>[]): SnapshotStoreConfig<BaseData, any>[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   determineCategory: function (snapshot: Snapshot<BaseData, any> | null | undefined): string {
// //     throw new Error("Function not implemented.");
// //   },
// //   determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeSnapshot: function (snapshotToRemove: SnapshotStore<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addSnapshotItem: function (item: Snapshot<any, any> | SnapshotStoreConfig<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addNestedStore: function (store: SnapshotStore<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   clearSnapshots: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addSnapshot: function (snapshot: Snapshot<BaseData, any>, snapshotId: string, subscribers: Subscriber<BaseData, any>[] & Record<string, Subscriber<BaseData, any>>): Promise<void> {
// //     throw new Error("Function not implemented.");
// //   },
// //   createSnapshot: undefined,
// //   createInitSnapshot: function (id: string, snapshotData: SnapshotStoreConfig<any, BaseData>, category: string): Snapshot<Data, Data> {
// //     throw new Error("Function not implemented.");
// //   },
// //   setSnapshotSuccess: function (snapshotData: SnapshotStore<BaseData, any>, subscribers: ((data: Subscriber<BaseData, any>) => void)[]): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   setSnapshotFailure: function (error: Error): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateSnapshots: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<BaseData, any>[], snapshot: Snapshots<BaseData>) => void): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateSnapshotsFailure: function (error: Payload): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   initSnapshot: function (snapshotConfig: SnapshotStoreConfig<BaseData, any>, snapshotData: SnapshotStore<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   takeSnapshot: function (snapshot: Snapshot<BaseData, any>, subscribers: Subscriber<BaseData, any>[]): Promise<{ snapshot: Snapshot<BaseData, any>; }> {
// //     throw new Error("Function not implemented.");
// //   },
// //   takeSnapshotSuccess: function (snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<BaseData, any>, index: number, array: SnapshotStoreConfig<BaseData, any>[]) => U): U extends (infer I)[] ? I[] : U[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   getState: function () {
// //     throw new Error("Function not implemented.");
// //   },
// //   setState: function (state: any): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   validateSnapshot: function (snapshot: Snapshot<BaseData, any>): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   handleActions: function (action: (selectedText: string) => void): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   setSnapshot: function (snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
// //     throw new Error("Function not implemented.");
// //   },
// //   setSnapshots: function (snapshots: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   clearSnapshot: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   mergeSnapshots: function (snapshots: Snapshots<BaseData>, category: string): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<BaseData, any>) => U, initialValue: U): U | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   sortSnapshots: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   filterSnapshots: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   findSnapshot: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSubscribers: function (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>): Promise<{ subscribers: Subscriber<BaseData, any>[]; snapshots: Snapshots<BaseData>; }> {
// //     throw new Error("Function not implemented.");
// //   },
// //   notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   notifySubscribers: function (subscribers: Subscriber<BaseData, any>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, any>[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getAllSnapshots: function (data: (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>) => Promise<Snapshots<BaseData>>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   generateId: function (): string {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchFetchSnapshots: function (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchTakeSnapshotsRequest: function (snapshotData: any): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<BaseData, any>[]) => Promise<{ subscribers: Subscriber<BaseData, any>[]; snapshots: Snapshots<BaseData>; }>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   filterSnapshotsByStatus: undefined,
// //   filterSnapshotsByCategory: undefined,
// //   filterSnapshotsByTag: undefined,
// //   batchFetchSnapshotsSuccess: function (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<BaseData, any>[], snapshots: Snapshots<BaseData>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   batchTakeSnapshot: function (snapshotStore: SnapshotStore<BaseData, any>, snapshots: Snapshots<BaseData>): Promise<{ snapshots: Snapshots<BaseData>; }> {
// //     throw new Error("Function not implemented.");
// //   },
// //   handleSnapshotSuccess: function (snapshot: Snapshot<Data, Data> | null, snapshotId: string): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getSnapshotId: function (key: string | SnapshotData<BaseData, any>): unknown {
// //     throw new Error("Function not implemented.");
// //   },
// //   compareSnapshotState: function (arg0: Snapshot<BaseData, any> | null, state: any): unknown {
// //     throw new Error("Function not implemented.");
// //   },
// //   eventRecords: null,
// //   snapshotStore: null,
// //   getParentId: function (snapshot: Snapshot<BaseData, any>): string | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   getChildIds: function (childSnapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addChild: function (snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeChild: function (snapshot: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   getChildren: function (): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   hasChildren: function (): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   isDescendantOf: function (snapshot: Snapshot<BaseData, any>, childSnapshot: Snapshot<BaseData, any>): boolean {
// //     throw new Error("Function not implemented.");
// //   },
// //   dataItems: null,
// //   newData: null,
// //   data: undefined,
// //   getInitialState: function (): Snapshot<BaseData, any> | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   getConfigOption: function (): SnapshotStoreConfig<BaseData, any> | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   getTimestamp: function (): Date | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   getStores: function (): Map<number, SnapshotStore<Data, any>>[] {
// //     throw new Error("Function not implemented.");
// //   },
// //   getData: function (): BaseData | Map<string, Snapshot<BaseData, any>> | null | undefined {
// //     throw new Error("Function not implemented.");
// //   },
// //   setData: function (data: Map<string, Snapshot<BaseData, any>>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   addData: function (data: Snapshot<BaseData, any>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   stores: null,
// //   getStore: function (storeId: number, snapshotStore: SnapshotStore<BaseData, any>, snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): SnapshotStore<BaseData, any> | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   addStore: function (storeId: number, snapshotStore: SnapshotStore<BaseData, any>, snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   mapSnapshot: function (storeId: number, snapshotStore: SnapshotStore<BaseData, any>, snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): Promise<string | undefined> | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   mapSnapshots: function (storeIds: number[], snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   removeStore: function (storeId: number, store: SnapshotStore<BaseData, any>, snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   unsubscribe: function (callback: Callback<Snapshot<BaseData, any>>): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   fetchSnapshot: function (callback: (snapshotId: string, payload: FetchSnapshotPayload<any>, snapshotStore: SnapshotStore<BaseData, any>, payloadData: BaseData | Data, category: symbol | string | Category | undefined, timestamp: Date, data: BaseData, delegate: SnapshotWithCriteria<BaseData, any>[]) => Snapshot<BaseData, any>): Snapshot<BaseData, any> {
// //     throw new Error("Function not implemented.");
// //   },
// //   addSnapshotFailure: function (snapshotManager: SnapshotManager<BaseData, any>, snapshot: Snapshot<BaseData, any>, payload: { error: Error; }): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   configureSnapshotStore: function (snapshotStore: SnapshotStore<BaseData, any>, snapshotId: string, data: Map<string, Snapshot<BaseData, any>>, events: Record<string, CalendarEvent<BaseData, any>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<BaseData, any>, payload: ConfigureSnapshotStorePayload<BaseData>, store: SnapshotStore<any, any>, callback: (snapshotStore: SnapshotStore<BaseData, any>) => void): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, any>, snapshot: Snapshot<BaseData, any>, payload: { error: Error; }): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, any>, snapshot: Snapshot<BaseData, any>, payload: { error: Error; }): Promise<void> {
// //     throw new Error("Function not implemented.");
// //   },
// //   createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, any>, snapshot: Snapshot<BaseData, any>, payload: { error: Error; }): void | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<BaseData, any>, snapshotManager: SnapshotManager<BaseData, any>, payload: CreateSnapshotsPayload<BaseData, any>, callback: (snapshots: Snapshot<BaseData, any>[]) => void | null, snapshotDataConfig?: SnapshotConfig<BaseData, any>[] | undefined, category?: string | CategoryProperties): Snapshot<BaseData, any>[] | null {
// //     throw new Error("Function not implemented.");
// //   },
// //   onSnapshot: function (snapshotId: string, snapshot: Snapshot<BaseData, any>, type: string, event: Event, callback: (snapshot: Snapshot<BaseData, any>) => void): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   onSnapshots: function (snapshotId: string, snapshots: Snapshots<BaseData>, type: string, event: Event, callback: (snapshots: Snapshots<BaseData>) => void): void {
// //     throw new Error("Function not implemented.");
// //   },
// //   label: undefined,
// //   events: undefined,
// //   handleSnapshot: function (id: string, snapshotId: string, snapshot: BaseData | null, snapshotData: BaseData, category: symbol | string | Category | undefined, callback: (snapshot: BaseData) => void, snapshots: Snapshots<Data>, type: string, event: Event, snapshotContainer?: BaseData | undefined, snapshotStoreConfig?: SnapshotStoreConfig<BaseData, any> | undefined): Promise<Snapshot<BaseData, any> | null> {
// //     throw new Error("Function not implemented.");
// //   },
// //   meta: undefined
// // };

// // subscriber.receiveSnapshot({
// //   ...sampleSnapshot,
// //   timestamp: new Date().toISOString(),
// //   value: typeof sampleSnapshot.value === 'string' ? sampleSnapshot.value : 0,
// //   tags: sampleSnapshot.tags ? Object.fromEntries(sampleSnapshot.tags.map(tag => [tag.name, tag.value])) : undefined
// // });
// export {
//     // sampleSnapshot, 
//     snapshot
// };

  export type { SnapshotConfig };
