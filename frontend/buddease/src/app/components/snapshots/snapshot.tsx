// snapshot

import { Persona } from "@/app/pages/personas/Persona";
import PersonaTypeEnum from "@/app/pages/personas/PersonaBuilder";
import { Signature } from "ethers";
import { LanguageEnum } from "../communications/LanguageEnum";
import { CustomTransaction } from "../crypto/SmartContractInteraction";
import { createCustomTransaction } from "../hooks/dynamicHooks/createCustomTransaction";
import { Data } from "../models/data/Data";
import { ProjectPhaseTypeEnum } from "../models/data/StatusType";
import { Settings } from "../state/stores/SettingsStore";
import { subscriber } from "../users/Subscriber";
import { User } from "../users/User";
import UserRoles from "../users/UserRoles";
import { CustomSnapshotData, Snapshot } from "./LocalStorageSnapshotStore";

// Example usage of the Snapshot interface
const snapshot: Snapshot<Data> = {
  id: "snapshot1",
  category: "example category",
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: ["sample", "snapshot"],

  data: {
    _id: "1",
    id: "data1",
    title: "Sample Data",
    description: "Sample description",
    timestamp: new Date(),
    category: "Sample category",
    scheduled: true,
    status: "Pending",
    notificationsEnabled: true,
    isActive: true,
    tags: ["Important"],
    phase: {
      id: "phase1",
      name: "Sample Phase",
      description: "Sample description",
      type: "Ideation",
      status: "Pending",
      tags: ["Important"],

      startDate: new Date(),
      endDate: new Date(),
      subPhases: [],
      component: {} as React.FC<any>,
      duration: 0,
      hooks: {
        onInit: () => {},
        onMount: () => {},
        onUnmount: () => {},
        onPhaseChange: () => {},
        onPhaseCompletion: () => {},
        onPhaseCreation: () => {},
        onPhaseDeletion: () => {},
        onPhaseUpdate: () => {},
        onPhaseMove: () => {},
        onPhaseDueDateChange: () => {},
        onPhasePriorityChange: () => {},
        onPhaseAssigneeChange: () => {},

        resetIdleTimeout: async () => {},
        isActive: false,
        progress: {
          id: "",
          value: 0,
          label: "",
          current: 0,
          max: 0,
          min: 0,
          percentage: 0,
          color: "",
          name: "",
          description: "",
          done: false,
        },
        condition: async (idleTimeoutDuration: number) => {
          return true;
        },
      },
    },
    phaseType: ProjectPhaseTypeEnum.Ideation,
    dueDate: new Date(),
    priority: "High",
    assignee: {
      id: "assignee1",
      username: "Assignee Name",
    } as User,
    collaborators: ["collab1", "collab2"],
    comments: [],
    attachments: [],
    subtasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "creator1",
    updatedBy: "updater1",
    analysisResults: [],
    audioUrl: "sample-audio-url",
    videoUrl: "sample-video-url",
    videoThumbnail: "sample-thumbnail-url",
    videoDuration: 60,
    collaborationOptions: [],
    videoData: {
      id: "video1",
      campaignId: 123,
      resolution: "1080p",
      size: "100MB",
      aspectRatio: "16:9",
      language: "en",
      subtitles: [],
      duration: 60,
      codec: "H.264",
      frameRate: 30,
      url: "",
      thumbnailUrl: "",
      uploadedBy: "",
      viewsCount: 0,
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      title: "",
      description: "",
      tags: [],
      createdAt: new Date(),
      uploadedAt: new Date(),
      updatedAt: new Date(),
      videoDislikes: 0,
      videoAuthor: "",
      videoDurationInSeconds: 60,
      uploadDate: new Date(),
      videoLikes: 0,
      videoViews: 0,
      videoComments: 0,
      videoThumbnail: "",
      videoUrl: "",
      videoTitle: "",
      thumbnail: "",
      videoDescription: "",
      videoTags: [],
      videoSubtitles: [],
      category: "",
      closedCaptions: [],
      license: "",
      isLive: false,
      isPrivate: false,
      isUnlisted: false,
      isProcessingCompleted: false,
      isProcessingFailed: false,
      isProcessingStarted: false,
      channel: "",
      channelId: "",
      isLicensedContent: false,
      isFamilyFriendly: false,
      isEmbeddable: false,
      isDownloadable: false,
      playlists: [],
      isDeleting: false,
      isCompleted: false,
      isUploading: false,
      isDownloading: false,
      isProcessing: false,
    },
    additionalData: {},
    ideas: [],
    members: [],
    leader: {
      id: "leader1",
      username: "Leader Name",
      email: "leader@example.com",
      fullName: "Leader Full Name",
      bio: "Leader Bio",
      userType: "Admin",
      hasQuota: true,
      tier: "0",
      token: "leader-token",
      uploadQuota: 100,
      usedQuota: 50,
      avatarUrl: "avatar-url",
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isAdmin: false,
      isActive: true,
      profilePicture: null,
      processingTasks: [],
      role: UserRoles.Leader,
      firstName: "",
      lastName: "",
      friends: [],
      blockedUsers: [],
      persona: new Persona(PersonaTypeEnum.Default),
      settings: {
        id: "",
        filter: (key: keyof Settings) => {},
        appName: "buddease",
        userId: 123,
        userSettings: setTimeout(() => {}, 1000), // Example timeout
        communicationMode: "email",
        enableRealTimeUpdates: true,
        defaultFileType: "pdf",
        allowedFileTypes: ["pdf", "docx", "txt"],
        enableGroupManagement: true,
        enableTeamManagement: true,
        idleTimeout: undefined,
        startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
          // Example implementation
          setTimeout(onTimeout, timeoutDuration);
        },
        idleTimeoutDuration: 60000, // 1 minute
        activePhase: "development",
        realTimeChatEnabled: true,
        todoManagementEnabled: true,
        notificationEmailEnabled: true,
        analyticsEnabled: true,
        twoFactorAuthenticationEnabled: true,
        projectManagementEnabled: true,
        documentationSystemEnabled: true,
        versionControlEnabled: true,
        userProfilesEnabled: true,
        accessControlEnabled: true,
        taskManagementEnabled: true,
        loggingAndNotificationsEnabled: true,
        securityFeaturesEnabled: true,
        collaborationPreference1: "Option 1",
        collaborationPreference2: "Option 2",
        theme: "light",
        language: LanguageEnum.English, // Example language
        fontSize: 14,
        darkMode: false,
        enableEmojis: true,
        enableGIFs: true,
        emailNotifications: true,
        pushNotifications: true,
        notificationSound: "ding.wav", // Example sound file
        timeZone: "UTC",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
        defaultProjectView: "list",
        taskSortOrder: "priority",
        showCompletedTasks: true,
        projectColorScheme: "blue",
        showTeamCalendar: true,
        teamViewSettings: [],
        defaultTeamDashboard: "overview",
        passwordExpirationDays: 90,
        privacySettings: [], // Example privacy settings
        thirdPartyApiKeys: {
          google: "your-google-api-key",
          facebook: "your-facebook-api-key",
        },
        externalCalendarSync: true,
        dataExportPreferences: [],
        dashboardWidgets: [],
        customTaskLabels: [],
        customProjectCategories: [],
        customTags: [],
        additionalPreference1: "Option A",
        additionalPreference2: "Option B",
        formHandlingEnabled: true,
        paginationEnabled: true,
        modalManagementEnabled: true,
        sortingEnabled: true,
        notificationSoundEnabled: true,
        localStorageEnabled: true,
        clipboardInteractionEnabled: true,
        deviceDetectionEnabled: true,
        loadingSpinnerEnabled: true,
        errorHandlingEnabled: true,
        toastNotificationsEnabled: true,
        datePickerEnabled: true,
        themeSwitchingEnabled: true,
        imageUploadingEnabled: true,
        passwordStrengthEnabled: true,
        browserHistoryEnabled: true,
        geolocationEnabled: true,
        webSocketsEnabled: true,
        dragAndDropEnabled: true,
        idleTimeoutEnabled: true,
        enableAudioChat: true,
        enableVideoChat: true,
        enableFileSharing: true,
        enableBlockchainCommunication: true,
        enableDecentralizedStorage: true,
        selectDatabaseVersion: "latest",
        selectAppVersion: "2.0",
        enableDatabaseEncryption: true,
      },
      interests: [],
      privacySettings: {
        hidePersonalInfo: true,
        enablePrivacyMode: false,
        enableTwoFactorAuth: true,
        restrictVisibilityToContacts: false,
        restrictFriendRequests: false,
        hideOnlineStatus: false,
        showLastSeenTimestamp: true,
        allowTaggingInPosts: true,
        enableLocationPrivacy: true,
        hideVisitedProfiles: true,
        restrictContentSharing: true,
        enableIncognitoMode: false,
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        chat: false,
        calendar: false,
        task: false,
        file: false,
        meeting: false,
        announcement: false,
        reminder: false,
        project: true,
        enabled: true,
        notificationType: "push",
        audioCall: false,
        videoCall: false,
        screenShare: false,
        mention: false,

        reaction: true,
        follow: true,
        poke: true,
        activity: false,

        thread: false,
        inviteAccepted: true,
        directMessage: true,
      },
      activityLog: [
        {
          id: "",
          activity: "",
          action: "Logged in",
          timestamp: new Date(),
        },
        {
          id: "",
          activity: "",
          action: "Updated profile",
          timestamp: new Date(),
        },
      ],
      socialLinks: {
        facebook: "https://facebook.com/leader",
        twitter: "https://twitter.com/leader",
        website: "https://website.com/leader",
        linkedin: "https://linkedin.com/leader",
        instagram: "https://finstagram.com/leader",
      },
      relationshipStatus: "Single",
      hobbies: ["Reading", "Traveling"],
      skills: ["Project Management", "Software Development"],
      achievements: ["Completed 100 projects", "Employee of the Month"],
      profileVisibility: "Public",
      profileAccessControl: {
        friendsOnly: true,
        allowTagging: true,
        blockList: [],
        allowMessagesFromNonContacts: true,
        shareProfileWithSearchEngines: false,
      },
      activityStatus: "Online",
      isAuthorized: true,
      notificationPreferences: {
        mobile: false,
        desktop: true,
        emailNotifications: true,
        pushNotifications: true,
        enableNotifications: true,
        notificationSound: "birds",
        notificationVolume: 50,
        sms: false,
      },
      securitySettings: {
        securityQuestions: ["What is your pet's name?"],
        twoFactorAuthentication: false,
        passwordPolicy: "StandardPolicy",
        passwordExpirationDays: 90,
        passwordStrength: "Strong",
        passwordComplexityRequirements: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireDigits: true,
          requireSpecialCharacters: false,
        },
        accountLockoutPolicy: {
          enabled: true,
          maxFailedAttempts: 5,
          lockoutDurationMinutes: 15,
        },
        accountLockoutThreshold: 50 //todo create way reset threshod
      },
      emailVerificationStatus: true,
      phoneVerificationStatus: true,
      walletAddress: "0x123456789abcdef",
      transactionHistory: [
        createCustomTransaction({
          id: "tx1",
          amount: 100,
          date: new Date(),
          description: "Sample transaction",
          type: null,
          typeName: null,
          to: null,
          nonce: 0,
          gasLimit: BigInt(0),
          gasPrice: null,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null,
          data: "",
          value: BigInt(0),
          chainId: BigInt(0),
          signature: null,
          accessList: [],
          maxFeePerBlobGas: null,
          blobVersionedHashes: null,
          hash: null,
          unsignedHash: "",
          from: null,
          fromPublicKey: null,
          isSigned(): boolean {
            return !!(
              this.type &&
              this.typeName &&
              this.from &&
              this.signature
            );
          },
          serialized: "",
          unsignedSerialized: "",
          inferType(): number {
            if (this.type !== null && this.type !== undefined) {
              return this.type;
            }
            return 0;
          },
          inferTypes(): number[] {
            const types: number[] = [];
            if (this.type !== null && this.type !== undefined) {
              types.push(this.type);
            }
            if (
              this.maxFeePerGas !== null &&
              this.maxPriorityFeePerGas !== null
            ) {
              types.push(2);
            }
            if (types.length === 0) {
              types.push(0);
            }
            return types;
          },
          isLegacy() {
            return this.type === 0 && this.gasPrice !== null;
          },
          isBerlin() {
            return (
              this.type === 1 &&
              this.gasPrice !== null &&
              this.accessList !== null
            );
          },
          isLondon() {
            return (
              this.type === 2 &&
              this.accessList !== null &&
              this.maxFeePerGas !== null &&
              this.maxPriorityFeePerGas !== null
            );
          },
          isCancun() {
            return (
              this.type === 3 &&
              this.to !== null &&
              this.accessList !== null &&
              this.maxFeePerGas !== null &&
              this.maxPriorityFeePerGas !== null &&
              this.maxFeePerBlobGas !== null &&
              this.blobVersionedHashes !== null
            );
          },
          clone(): CustomTransaction {
            const clonedData: CustomTransaction = {
              _id: this._id as string,
              id: this.id as string,
              amount: this.amount,
              date: this.date as Date,
              title: this.title as string,
              value: this.value as bigint,
              description: this.description || "",
              startDate: this.startDate ? new Date(this.startDate) : undefined,
              endDate: this.endDate ? new Date(this.endDate) : undefined,
              isSigned:
                typeof this.isSigned === "function"
                  ? this.isSigned.bind(this)
                  : this.isSigned,
              serialized: this.serialized,
              unsignedSerialized: this.unsignedSerialized,
              nonce: this.nonce as number,
              gasLimit: this.gasLimit as bigint,
              chainId: this.chainId,
              hash: this.hash,
              type: this.type as number,
              typeName: this.typeName || "",
              data: this.data || "",
              unsignedHash: this.unsignedHash || "",
              to: this.to,
              gasPrice: this.gasPrice as bigint,
              maxFeePerGas: this.maxFeePerGas as bigint,
              maxPriorityFeePerGas: this.maxPriorityFeePerGas as bigint,
              signature: this.signature as Signature,
              accessList: this.accessList,
              maxFeePerBlobGas: this.maxFeePerBlobGas as bigint,
              blobVersionedHashes: this.blobVersionedHashes as string,
              from: this.from as string,
              fromPublicKey: this.fromPublicKey,
              isLegacy:
                typeof this.isLegacy === "function"
                  ? this.isLegacy.bind(this)
                  : this.isLegacy,
              isBerlin:
                typeof this.isBerlin === "function"
                  ? this.isBerlin.bind(this)
                  : this.isBerlin,
              isLondon:
                typeof this.isLondon === "function"
                  ? this.isLondon.bind(this)
                  : this.isLondon,
              isCancun:
                typeof this.isCancun === "function"
                  ? this.isCancun.bind(this)
                  : this.isCancun,
              inferType:
                typeof this.inferType === "function"
                  ? this.inferType.bind(this)
                  : this.inferType,
              inferTypes:
                typeof this.inferTypes === "function"
                  ? this.inferTypes.bind(this)
                  : this.inferTypes,
              clone: typeof this.clone === "function" ? this.clone : this.clone,

              equals: function (
                this: CustomTransaction,
                data: CustomTransaction
              ): boolean {
                return (
                  this.id === data.id &&
                  this._id === data._id &&
                  this.title === data.title &&
                  this.amount === data.amount &&
                  this.date?.getTime() === data.date?.getTime() &&
                  this.description === data.description &&
                  this.startDate?.getTime() === data.startDate?.getTime() &&
                  this.endDate?.getTime() === data.endDate?.getTime() &&
                  this.serialized === data.serialized &&
                  this.unsignedSerialized === data.unsignedSerialized &&
                  this.accessList === data.accessList &&
                  this.to === data.to &&
                  this.nonce === data.nonce &&
                  this.gasLimit === data.gasLimit &&
                  this.gasPrice === data.gasPrice &&
                  this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
                  this.maxFeePerGas === data.maxFeePerGas &&
                  this.type === data.type &&
                  this.data === data.data &&
                  this.value === data.value &&
                  this.chainId === data.chainId &&
                  this.signature === data.signature &&
                  this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
                  this.blobVersionedHashes === data.blobVersionedHashes &&
                  this.hash === data.hash &&
                  this.unsignedHash === data.unsignedHash &&
                  this.from === data.from &&
                  this.fromPublicKey === data.fromPublicKey
                  //if ther eare any new props ensure to add && above after the ast value
                  // Check other properties as needed
                  // Add checks for other properties here
                );
              },
              getSubscriptionLevel: function (this: CustomTransaction) {
                return "Pro";
              },
              getRecentActivity: function (this: CustomTransaction) {
                return [
                  { action: "Created snapshot", timestamp: new Date() },
                  { action: "Edited snapshot", timestamp: new Date() },
                ];
              },
              notificationsEnabled: true,
              recentActivity: [
                { action: "Created snapshot", timestamp: new Date() },
                { action: "Edited snapshot", timestamp: new Date() },
              ],
            };
            return clonedData;
          },
          equals(data: CustomTransaction) {
            const isSigned =
              typeof this.isSigned === "function"
                ? this.isSigned()
                : this.isSigned;
            const dataIsSigned =
              typeof data.isSigned === "function"
                ? data.isSigned()
                : data.isSigned;
            const isCancun =
              typeof this.isCancun === "function"
                ? this.isCancun()
                : this.isCancun;
            const dataIsCancun =
              typeof data.isCancun === "function"
                ? data.isCancun()
                : data.isCancun;
            const isLegacy =
              typeof this.isLegacy === "function"
                ? this.isLegacy()
                : this.isLegacy;
            const dataIsLegacy =
              typeof data.isLegacy === "function"
                ? data.isLegacy()
                : data.isLegacy;
            const isBerlin =
              typeof this.isBerlin === "function"
                ? this.isBerlin()
                : this.isBerlin;
            const dataIsBerlin =
              typeof data.isBerlin === "function"
                ? data.isBerlin()
                : data.isBerlin;
            const isLondon =
              typeof this.isLondon === "function"
                ? this.isLondon()
                : this.isLondon;
            const dataIsLondon =
              typeof data.isLondon === "function"
                ? data.isLondon()
                : data.isLondon;

            return (
              this.id === data.id &&
              this.amount === data.amount &&
              this.date?.getTime() === data.date?.getTime() &&
              this.description === data.description &&
              this.nonce === data.nonce &&
              this.gasLimit === data.gasLimit &&
              this.gasPrice === data.gasPrice &&
              this.maxPriorityFeePerGas === data.maxPriorityFeePerGas &&
              this.maxFeePerGas === data.maxFeePerGas &&
              this.data === data.data &&
              this.value === data.value &&
              this.chainId === data.chainId &&
              this.from === data.from &&
              this.fromPublicKey === data.fromPublicKey &&
              this.to === data.to &&
              this.type === data.type &&
              this.typeName === data.typeName &&
              this.serialized === data.serialized &&
              this.unsignedSerialized === data.unsignedSerialized &&
              this.accessList?.length === data.accessList?.length &&
              this.maxFeePerBlobGas === data.maxFeePerBlobGas &&
              this.blobVersionedHashes === data.blobVersionedHashes &&
              (isSigned ?? false) === (dataIsSigned ?? false) &&
              (isCancun ?? false) === (dataIsCancun ?? false) &&
              (isLegacy ?? false) === (dataIsLegacy ?? false) &&
              (isBerlin ?? false) === (dataIsBerlin ?? false) &&
              (isLondon ?? false) === (dataIsLondon ?? false)
            );
          },
          recentActivity: [
            {
              action: "Logged in",
              timestamp: new Date(),
            },
            {
              action: "Updated profile",
              timestamp: new Date(),
            },
          ],
        }),
      ],
    },
  },
};

const sampleSnapshot: CustomSnapshotData = {
  timestamp: new Date().toISOString(),
  value: 42,
  category: "sample snapshot",
};

subscriber.receiveSnapshot(sampleSnapshot);
export { snapshot };
