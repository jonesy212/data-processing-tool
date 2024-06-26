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
        // For example: 'projectDetails', 'projectTasks', 'projectMilestones', etc.
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

const userIsDeveloper = true;
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
