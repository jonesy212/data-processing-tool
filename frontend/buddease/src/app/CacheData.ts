import { CacheData } from "./generators/GenerateCache";

// Initialize cacheData based on the interface
let cacheData: CacheData = {
    lastUpdated: "",
    userPreferences: {
        modules: 'modules',
        actions: [],
        reducers: []
    },
    userSettings: {
        communicationMode: "text",
        enableRealTimeUpdates: true,
        defaultFileType: "document",
        allowedFileTypes: ["document"],
        enableGroupManagement: true,
        enableTeamManagement: true,

        realTimeChatEnabled: false,
        todoManagementEnabled: false,
        notificationEmailEnabled: false,
        analyticsEnabled: false,
        twoFactorAuthenticationEnabled: false,
        projectManagementEnabled: false,
        documentationSystemEnabled: false,
        versionControlEnabled: false,
        userProfilesEnabled: false,
        accessControlEnabled: false,
        taskManagementEnabled: false,
        loggingAndNotificationsEnabled: false,
        securityFeaturesEnabled: false,
        collaborationPreference1: undefined,
        collaborationPreference2: undefined,
        theme: "",
        language: "",
        fontSize: 0,
        darkMode: false,
        enableEmojis: false,
        enableGIFs: false,
        emailNotifications: false,
        pushNotifications: false,
        notificationSound: "",
        timeZone: "",
        dateFormat: "",
        timeFormat: "",
        defaultProjectView: "",
        taskSortOrder: "",
        showCompletedTasks: false,
        projectColorScheme: "",
        showTeamCalendar: false,
        teamViewSettings: [],
        defaultTeamDashboard: "",
        passwordExpirationDays: 0,
        privacySettings: [],
        thirdPartyApiKeys: {} as Record<string, string>,
        externalCalendarSync: false,
        dataExportPreferences: [],
        dashboardWidgets: [],
        customTaskLabels: [],
        customProjectCategories: [],
        customTags: [],
        additionalPreference1: undefined,
        additionalPreference2: undefined,
        formHandlingEnabled: false,
        paginationEnabled: false,
        modalManagementEnabled: false,
        sortingEnabled: false,
        notificationSoundEnabled: false,
        localStorageEnabled: false,
        clipboardInteractionEnabled: false,
        deviceDetectionEnabled: false,
        loadingSpinnerEnabled: false,
        errorHandlingEnabled: false,
        toastNotificationsEnabled: false,
        datePickerEnabled: false,
        themeSwitchingEnabled: false,
        imageUploadingEnabled: false,
        passwordStrengthEnabled: false,
        browserHistoryEnabled: false,
        geolocationEnabled: false,
        webSocketsEnabled: false,
        dragAndDropEnabled: false,
        idleTimeoutEnabled: false,
    },
   
    dataVersions: {
        users: 0,
        products: 0,
        authentication: 0,
        company: 0,
        tasks: 0,
        todos: 0
    },
    frontendStructure: {
        components: [],
        actions: [],
        auth: {
            routers: [],
            components: [],
            context: ""
        },
        cards: {
            types: [],
            actions: [],
            containers: [],
            init: {
                types: [],
                actions: []
            },
            todo: []
        },
        communications: {
            chat: "",
            email: []
        },
        dashboards: {
            types: [],
            loaders: []
        },
        documents: {
            attachment: "",
            builder: "",
            editor: "",
            screenFunctionality: {
                keys: "",
                tooltips: ""
            }
        },
        hooks: {
            generators: [],
            usage: []
        },
        lists: [],
        onboarding: [],
        prompts: [],
        routing: {
            protectedRoute: "",
            search: ""
        },
        state: {
            mobxReact: "",
            redux: {
                actions: [],
                reducers: [],
                slices: []
            },
            stores: {
                iconStore: "",
                rootStores: "",
                generators: "",
                storeProvider: "",
                userPreferences: {
                    modules: {
                        appearance: {
                            actions: [ENABLE_REAL_TIME_CHAT, ENABLE_NOTIFICATION_EMAIL],
                            reducers: []
                        },
                        communication: {
                            actions: [],
                            reducers: []
                        },
                        collaboration: {
                            actions: [],
                            reducers: []
                        }
                    },
                    actions: [],
                    reducers: []
                }
            }
        },
        styling: {
            accessibility: "",
            animationsAndTransitions: "",
            colorPalette: "",
            colorPicker: "",
            documentation: "",
            dynamicColorPalette: "",
            dynamicComponents: "",
            dynamicIconsAndImages: "",
            dynamicSpacingAndLayout: "",
            dynamicTypography: "",
            palette: "",
            paletteManager: "",
            responsiveDesign: ""
        },
        support: {
            userSupport: ""
        },
        todos: {
            fetchTodos: "",
            todoActions: "",
            todoList: "",
            todoReducer: "",
            tasks: {
                dataProcessingTask: "",
                user: ""
            }
        },
        tooltips: {
            todo: ""
        },
        versions: {
            versioning: ""
        },
        css: {
            search: "",
            stylesheet: ""
        },
        images: [],
        layout: "",
        pageModule: "",
        page: "",
        pages: {
            supportResponse: "",
            app: "",
            dashboards: {
                dashboard: "",
                dashboardLoader: "",
                recruiterSeekerDashboard: "",
                index: ""
            },
            forms: {
                changePasswordForm: "",
                emailVerificationForm: "",
                forgotPasswordForm: "",
                loginForm: "",
                utils: {
                    commonLoginLogic: ""
                }
            },
            index: "",
            layouts: {
                commonLayout: "",
                dashboardLayout: "",
                layouts: ""
            },
            onboarding: {
                gettingToKnowYouPage: "",
                offerLandingPage: "",
                questionnairePage: ""
            },
            recruiterDashboard: "",
            searchs: {
                search: "",
                userSearch: "",
                todo: ""
            },
            upload: ""
        },
        todo: {
            todos: ""
        },
        ts: {
            clipboard: "",
            events: ""
        }
    }
};
