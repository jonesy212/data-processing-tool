// Member.ts
import { LanguageEnum } from '@/core/communications/LanguageEnum';
import { Team } from '@/core/components/teams/Team';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { UserRole } from "@/core/models/UserRole";
import { UserRoleEnum } from '@/core/models/UserRoles';
import type { Task } from '@/core/models/tasks/Task';
import { Persona } from "@/core/pages/personas/Persona";
import PersonaTypeEnum from '@/core/pages/personas/PersonaBuilder';
import type { MemberAttachment, MemberData, MemberEntity, MemberMeta } from '@/core/typings/entities/MemberEntity';
import { MemberExcludedFields, MemberIncludedFields, MemberK } from '@/core/typings/entities/MemberEntity';
    MemberAttachment,
    MemberData,
    MemberEntity,
    MemberExcludedFields,
    MemberIncludedFields,
    MemberK,
    MemberMeta,
} from '@/core/typings/entities/MemberEntity';
import type { UserAttachment, UserEntity, UserExcludedFields, UserIncludedFields, UserK, UserMeta } from '@/core/typings/entities/UserEntity';
import type { User } from "@/core/users/User";


export interface Member<
	T extends BaseDataEntity,
	K extends T = T,
	Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
	AttachmentType extends Attachment = Attachment,
	ExcludedFields extends keyof T = DefaultExcludedFields<T>,
	IncludedFields extends keyof T = keyof T
> extends User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
	teamId?: string;
	roleInTeam: string;
	memberName: string;
	host?: boolean;
	teams?: Team<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
	// Add other member-specific properties here
}

const DEFAULT_REFRESH_UI = () => { };

// Option 1: Using the exact MemberEntity generic parameters
const memberData: MemberData<
	MemberEntity,
	MemberK,
	MemberMeta,
	MemberAttachment,
	MemberExcludedFields,
	MemberIncludedFields
> = {
	id: "member-001",
	username: 'member1',
	email: 'member1@example.com',
	teamId: "team-001",
	roleInTeam: "developer",
	_id: "mongo-member-001",
	tier: "premium",
	uploadQuota: 1024,
	fullName: "John Doe",
	bio: "Experienced software developer with 5+ years in web development",
	userType: "premium_user",
	bannerUrl: "https://example.com/default-banner.jpg",
	hasQuota: false,
	profilePicture: "https://example.com/avatars/member1.jpg",
	storeId: 12345,
	memberName: "member_name",

	isAuthorized: true,

	activityStatus: "online",
	activityLog: {
		activity: {}, 
		action: []
	},

	persona: {
		type: PersonaTypeEnum.Influencer,
		id: "",
		name: "",
		age: 18,
		gender: "",
	},
	friends: [
		{
			username: "",
			email: "",
			tier: "",
			isAuthorized: true,
		
			uploadQuota: 0,
			hasQuota: false,
			processingTasks: [
				{
					id: 1,
					name: "Data Analysis Task",
					description: "Analyzing user data for insights",
					status: "completed",
					inputDatasetId: 123,
					outputDatasetId: 456,
					createdAt: new Date(),
					startTime: new Date(),
					completionTime: new Date(),
					user: {
						username: "member1",
						email: "member1@example.com",
						tier: "premium",
						isAuthorized: true,
						uploadQuota: 1024,
						hasQuota: true,
						processingTasks: [],
						activityStatus: "active",
						activityLog: [],
						persona: null,
						friends: [],
						blockedUsers: [],
						data: {} as Data<MemberEntity,
										MemberK,
										MemberMeta,
										MemberAttachment,
										MemberExcludedFields,
										MemberIncludedFields>
						// Add other required User properties
					} as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>
				}
			],
			activityStatus: "",
			
			activityLog: [],
			friends: [],
			blockedUsers: [],
			persona: {		
				id: "persona-001",
				name: "May",
				age: 32,
				gender: "woman",
				type: PersonaTypeEnum.Developer,

				traits: ["analytical", "creative", "collaborative"],
				preferences: ["code_reviews", "pair_programming"]
			} as Persona,
		}
	],
	blockedUsers: [],

	roles: [
		{
			roleType: UserRoleEnum.Member,
			responsibilities: ["basic platform access"],
			permissions: ["read", "comment"],
			positions: [{ title: "Member", level: 1 }],
			includes: ["basic_features"]
		},
		{
			roleType: UserRoleEnum.Contributor,
			responsibilities: ["content creation", "community contributions"],
			permissions: ["read", "write", "upload"],
			positions: [{ title: "Contributor", level: 2 }],
			includes: ["upload_access", "content_creation"]
		}
	],
	followers: [
		{
			username: "user123",
			email: "user123@example.com",
			tier: "basic",
			isAuthorized: true,
			uploadQuota: 512,
			hasQuota: true,
			processingTasks: [],
			activityStatus: "active",
			activityLog: [],
			persona: null,
			friends: [],
			blockedUsers: [],
			data: {} as UserData<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>
			// Add other required User properties
		} as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>,
		{
			username: "user456",
			email: "user456@example.com",
			tier: "premium",
			isAuthorized: true,
			uploadQuota: 1024,
			hasQuota: true,
			processingTasks: [],
			activityStatus: "active",
			activityLog: [],
			persona: null,
			friends: [],
			blockedUsers: [],
			data: {} as UserData<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>
			// Add other required User properties
		} as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>,
	],
	preferences: {
		refreshUI: DEFAULT_REFRESH_UI,
		theme: "dark",
		language: LanguageEnum.English,
		notifications: {
			email: true,           // Email notifications enabled
			sms: false,            // SMS notifications disabled  
			pushNotifications: true, // Push notifications enabled
			desktopNotifications: true, // Desktop notifications enabled
			emailFrequency: 'immediate', // Immediate email notifications
			smsFrequency: 'daily',       // Daily SMS notifications
			customNotifications: {}      // Empty custom notifications
		},
	},

	processingTasks: {},
	role: {
		id: "role-001",
		name: "Developer",
		permissions: ["read", "write", "delete"],
		level: 2,
		roleType: UserRoleEnum.Member,
		responsibilities: [],
		positions: [],
		includes: []

	} as UserRole,
	timeBasedCode: "TBC-123456",

	snapshots: [],
	token: "auth-token-xyz-123",
	avatarUrl: "https://example.com/avatars/member1.jpg",
	createdAt: new Date("2023-01-15"),
	updatedAt: new Date("2024-01-20"),
	isVerified: true,
	isAdmin: false,
	isActive: true,
	firstName: "John",
	lastName: "Doe",
	settings: {
		privacy: "public",
		emailNotifications: true,
		pushNotifications: false,
		twoFactorAuth: true
	},
	interests: ["programming", "gaming", "photography", "hiking"],
	privacySettings: {
		profileVisibility: "public",
		emailVisibility: "friends_only",
		activityVisibility: "public",
		friendListVisibility: "friends_only"
	},
	notifications: {
		email: true,
		push: false,
		sms: false,
		frequency: "daily"
	},
	activityLog: [
		{
			id: "activity-001",
			type: "login",
			activity: {}, 
			action: [],
			timestamp: new Date("2024-01-20T10:00:00"),
			details: "User logged in successfully"
		}
	],
	socialLinks: {
		github: "https://github.com/johndoe",
		twitter: "https://twitter.com/johndoe",
		linkedin: "https://linkedin.com/in/johndoe"
	},
	relationshipStatus: "single",
	hobbies: ["coding", "gaming", "reading", "traveling"],
	skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python"],
	achievements: [
		{
			id: "achieve-001",
			title: "First Project",
			description: "Completed first major project",
			date: new Date("2023-03-15")
		}
	],
	profileVisibility: "public",
	profileAccessControl: {
		  // Privacy
		isPrivate: false,
		isPrivateOnly: false,
		isPrivateOnlyForContacts: true,
		isPrivateOnlyForGroups: false,
		friendsOnly: false,
		
		// Messaging
		allowMessagesFromNonContacts: true,
		allowMessagesFromFriendContacts: true,
		canSendMessages: true,
		
		// Visibility
		canViewProfile: true,
		canSeeFriends: true,
		canSeeActivity: true,
		canSeeOnlineStatus: true,
		canSeeLastSeen: true,
		canSeeProfilePicture: true,
		canSeePosts: true,
		canSeeContactInfo: false,
		canSeeMutualFriends: true,
		
		// Interaction
		allowTagging: true,
		canCommentOnPosts: true,
		canAddToGroups: false,
		canShareProfile: true,
		
		// Security
		blockList: [],
		isAuthorized: true,
		shareProfileWithSearchEngines: true,
		
		// Status
		activityStatus: ActivityStatus.Online
	},

	// MemberData specific fields
	datasets: "user-dataset-001,user-dataset-002",
	tasks: [
		{
			id: "task-001",
			title: "Complete onboarding",
			status: "completed",
			priority: "high",
			dueDate: new Date("2024-01-25")
		} as Task<MemberEntity, MemberK, MemberMeta, MemberAttachment, MemberExcludedFields, MemberIncludedFields>
	],
	questionnaireResponses: {
		onboarding: {
			completed: true,
			responses: {
				experience: "5 years",
				skills: ["JavaScript", "React"]
			}
		}
	},
	joinDate: new Date("2023-01-15"),
	lastActive: new Date("2024-01-20T14:30:00"),
	status: "active",
	projects: [],
	permissions: ["read", "write", "comment"]
};


export { memberData };
















