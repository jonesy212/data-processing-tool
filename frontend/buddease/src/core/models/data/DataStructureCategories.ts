// DataStructureCategories.ts
// Data related categories
const dataCategories = {
    notes: [
        'assignedNotes'
    ],
    goals: [
        'assignedGoals'
    ],
    files: [
        'assignedFiles'
    ],
    events: [
        'assignedEvents',
        'assignedCalendarEvents'
    ],
    contacts: [
        'assignedContacts'
    ],
    bookmarks: [
        'assignedBookmarks'
    ]
};

// Board related categories
const boardCategories = {
    boardItems: [
        'assignedBoardItems',
        'assignedBoardColumns',
        'assignedBoardLists',
        'assignedBoardCards',
        'assignedBoardViews',
        'assignedBoardComments',
        'assignedBoardActivities',
        'assignedBoardLabels',
        'assignedBoardMembers',
        'assignedBoardSettings',
        'assignedBoardPermissions',
        'assignedBoardNotifications',
        'assignedBoardIntegrations',
        'assignedBoardAutomations',
        'assignedBoardCustomFields'
    ]
};

// Task related categories
const taskCategories = {
    todos: [
        'assignedTodos'
    ]
};

// Team related categories
const teamCategories = {
    teams: [
        'assignedTeams'
    ]
};

// Community related categories
const communityCategories = {
    community: [
        // Add community-specific data structures here
        // For example: 'communityPosts', 'communityComments', etc.
    ]
};

// Projects related categories
const projectsCategories = {
    projects: [
        // Add project-specific data structures here
        // For example: 
        'projectDetails', 'projectTasks', 'projectMilestones', 
    ]
};


// Developer related categories
const developerCategories = {
    developerTasks: [
        'assignedDeveloperTasks',
        'developerInProgressTasks',
        'developerCompletedTasks'
    ],
    developerProjects: [
        'assignedDeveloperProjects',
        'developerActiveProjects',
        'developerArchivedProjects'
    ],
    developerBugs: [
        'assignedDeveloperBugs',
        'developerOpenBugs',
        'developerResolvedBugs'
    ],
    developerCommits: [
        'developerGitCommits',
        'developerSVNCommits',
        'developerMercurialCommits'
    ]
};

// Define a type for categories when the user is not a developer
type AllCategoryValuesWithoutDeveloper = 
    typeof dataCategories[keyof typeof dataCategories][number] |
    typeof boardCategories[keyof typeof boardCategories][number] |
    typeof taskCategories[keyof typeof taskCategories][number] |
    typeof teamCategories[keyof typeof teamCategories][number] |
    typeof communityCategories[keyof typeof communityCategories][number] |
    typeof projectsCategories[keyof typeof projectsCategories][number];

// Define a type for categories when the user is a developer
type DeveloperCategoryValues = typeof developerCategories[keyof typeof developerCategories][number];

const userIsDeveloper = true;
// Conditionally select the type based on `userIsDeveloper`
type AllCategoryValues = typeof userIsDeveloper extends true 
    ? AllCategoryValuesWithoutDeveloper | DeveloperCategoryValues 
    : AllCategoryValuesWithoutDeveloper;

// Merge all categories
export const allCategories = {
    ...dataCategories,
    ...boardCategories,
    ...taskCategories,
    ...teamCategories,
    ...communityCategories,
    ...projectsCategories,
    ...(userIsDeveloper ? developerCategories : {}),
};
export type {AllCategoryValues}